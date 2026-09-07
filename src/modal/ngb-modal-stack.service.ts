import { NgbModalBackdrop } from "@ngb/modal/ngb-modal-backdrop.component";
import type { NgbModalOptions, NgbModalUpdatableOptions } from "@ngb/modal/ngb-modal-config.service";
import { NgbActiveModal, NgbModalRef } from "@ngb/modal/ngb-modal-ref";
import { NgbModalWindow } from "@ngb/modal/ngb-modal-window.component";
import { NgbScrollbar } from "@ngb/ngb-scrollbar.service";
import { ngbFocusTrap } from "@ngb/utils/focus-trap";
import { ContentRef } from "@ngb/utils/popup.service";
import angular, { type IAugmentedJQuery, type IDeferred, type IPromise, type IQService } from "angular";
import { ApplicationRef, type ComponentRef, NgZone, TemplateRef } from "ngjs-core";
import { createComponent } from "ngjs-core/runtime";
import { Subject, take } from "rxjs";

export class NgbModalStack {
  private _scrollBarRestoreFn: null | (() => void) = null;
  private _modalRefs: NgbModalRef[] = [];
  private _windowRefs: ComponentRef<NgbModalWindow>[] = [];
  private _ariaHiddenValues: Map<Element, string | null> = new Map();

  private _activeWindowCmptHasChanged = new Subject<void>();
  private _activeInstances?: IDeferred<NgbModalRef[]>;

  constructor(
    private ngbScrollbar: NgbScrollbar,
    private _ngZone: NgZone,
    private _applicationRef: ApplicationRef,
    private $q: IQService,
  ) {
    this._activeInstances = this.$q.defer();

    this._activeWindowCmptHasChanged.subscribe(() => {
      if (!this._windowRefs.length) {
        this._revertAriaHidden();
        return;
      }

      const activeWindow = this._windowRefs[this._windowRefs.length - 1];
      ngbFocusTrap(this._ngZone, activeWindow.location.nativeElement, this._activeWindowCmptHasChanged);
      this._revertAriaHidden();
      this._setAriaHidden(activeWindow.location.nativeElement);
    });
  }

  public open<T = any>(content: any, options: NgbModalOptions): IPromise<NgbModalRef<T>> {
    const container = this._resolveContainer(options.container);

    if (!container) {
      throw new Error(`The specified modal container "${options.container || "body"}" was not found in the DOM.`);
    }

    this._hideScrollBar();

    const activeModal = new NgbActiveModal();
    return this.$q
      .all({
        backdropRef:
          options.backdrop !== false
            ? this._attachBackdrop(container)
            : this.$q.resolve<ComponentRef<NgbModalBackdrop> | undefined>(undefined),
        contentRef: this._getContentRef<T>(content, activeModal, options),
      })
      .then(({ backdropRef, contentRef }) =>
        this._attachWindowComponent(container, contentRef).then((windowRef) => {
          const ngbModalRef = new NgbModalRef<T>(this.$q, windowRef, contentRef, backdropRef, options.beforeDismiss);

          activeModal.close = (result: any) => ngbModalRef.close(result);
          activeModal.dismiss = (reason: any) => ngbModalRef.dismiss(reason);
          activeModal.update = (options: NgbModalUpdatableOptions) => ngbModalRef.update(options);

          ngbModalRef.update(options);
          this._registerModalRef(ngbModalRef);
          this._registerWindow(windowRef);

          if (this._modalRefs.length === 1) document.body.classList.add("modal-open");

          ngbModalRef.hidden.pipe(take(1)).subscribe(() =>
            this.$q.resolve(true).then(() => {
              if (this._modalRefs.length) return;
              document.body.classList.remove("modal-open");
              this._restoreScrollBar();
              this._revertAriaHidden();
            }),
          );

          return ngbModalRef;
        }),
      );
  }

  private _registerWindow(ngbWindow: ComponentRef<NgbModalWindow>) {
    this._windowRefs.push(ngbWindow);
    this._activeWindowCmptHasChanged.next();

    ngbWindow.onDestroy(() => {
      const index = this._windowRefs.indexOf(ngbWindow);

      if (index > -1) {
        this._windowRefs.splice(index, 1);
        this._activeWindowCmptHasChanged.next();
      }
    });
  }

  get activeInstances() {
    return this._activeInstances?.promise;
  }

  dismissAll(reason?: any) {
    this._modalRefs.forEach((ngbModalRef) => {
      ngbModalRef.dismiss(reason);
    });
  }

  hasOpenModals(): boolean {
    return this._modalRefs.length > 0;
  }

  private _registerModalRef(ngbModalRef: NgbModalRef) {
    const unregisterModalRef = () => {
      const index = this._modalRefs.indexOf(ngbModalRef);

      if (index > -1) {
        this._modalRefs.splice(index, 1);
        this._activeInstances?.notify(this._modalRefs);
      }
    };

    this._modalRefs.push(ngbModalRef);
    this._activeInstances?.notify(this._modalRefs);
    ngbModalRef.result?.then(unregisterModalRef, unregisterModalRef);
  }

  private _resolveContainer(container?: IAugmentedJQuery | string): IAugmentedJQuery | undefined {
    if (angular.isString(container)) {
      const native = document.querySelector(String(container));

      if (!native) return undefined;
      return angular.element(native);
    }

    return container ?? angular.element(document.body);
  }

  private _attachBackdrop(container: IAugmentedJQuery): IPromise<ComponentRef<NgbModalBackdrop>> {
    return this._createRootComponent<NgbModalBackdrop>(NgbModalBackdrop.$name).then((ref) => {
      container.append(angular.element(ref.location.nativeElement));
      return ref;
    });
  }

  private _attachWindowComponent(
    container: IAugmentedJQuery,
    contentRef: ContentRef,
  ): IPromise<ComponentRef<NgbModalWindow>> {
    return this._createRootComponent<NgbModalWindow>(NgbModalWindow.$name, {
      projectableNodes: contentRef.nodes,
    }).then((ref) => {
      container.append(angular.element(ref.location.nativeElement));
      return ref;
    });
  }

  private _getContentRef<T>(content: any, activeModal: NgbActiveModal, options: NgbModalOptions): IPromise<ContentRef<T>> {
    if (content instanceof TemplateRef) {
      const viewRef = content.createEmbeddedView({
        $implicit: activeModal,
        close: (result?: any) => activeModal.close(result),
        dismiss: (reason?: any) => activeModal.dismiss(reason),
      });
      this._applicationRef.attachView(viewRef);
      return this.$q.resolve(new ContentRef<T>([viewRef.rootNodes], viewRef));
    }

    return this._createRootComponent<T>(content, {
      bindings: {
        ...options.bindings,
        ngbActiveModal: activeModal,
      },
    }).then((componentRef) => {
      if (options.scrollable) {
        angular
          .element(componentRef.location.nativeElement)
          .addClass("component-host-scrollable d-flex flex-column overflow-hidden");
      }

      return new ContentRef<T>([[componentRef.location.nativeElement]], undefined, componentRef);
    });
  }

  private _createRootComponent<C>(
    component: string,
    options?: { projectableNodes?: Node[][]; bindings?: Record<string, unknown> },
  ): IPromise<ComponentRef<C>> {
    return createComponent<C>(component, {
      environmentInjector: this._applicationRef.injector,
      ...options,
    }).then((componentRef) => {
      return this._attachRootComponent(componentRef);
    });
  }

  private _attachRootComponent<C>(componentRef: ComponentRef<C>): ComponentRef<C> {
    try {
      this._applicationRef.attachView(componentRef.hostView);
      componentRef.changeDetectorRef.markForCheck();
    } catch (error) {
      componentRef.destroy();
      throw error;
    }

    componentRef.onDestroy(() => this._applicationRef.detachView(componentRef.hostView));
    return componentRef;
  }

  private _setAriaHidden(node: HTMLElement) {
    const parent = node.parentElement;
    const body = document.body as HTMLBodyElement;

    if (parent && node !== body) {
      Array.from(parent.children).forEach((sibling) => {
        if (sibling !== node && sibling.nodeName !== "SCRIPT") {
          this._ariaHiddenValues.set(sibling, sibling.getAttribute("aria-hidden"));
          sibling.setAttribute("aria-hidden", "true");
        }
      });

      this._setAriaHidden(parent);
    }
  }

  private _revertAriaHidden() {
    this._ariaHiddenValues.forEach((value, element) => {
      if (value) {
        element.setAttribute("aria-hidden", value);
        return;
      }

      element.removeAttribute("aria-hidden");
    });

    this._ariaHiddenValues.clear();
  }

  private _restoreScrollBar() {
    const scrollBarRestoreFn = this._scrollBarRestoreFn;

    if (scrollBarRestoreFn) {
      this._scrollBarRestoreFn = null;
      scrollBarRestoreFn();
    }
  }

  private _hideScrollBar() {
    if (!this._scrollBarRestoreFn) {
      this._scrollBarRestoreFn = this.ngbScrollbar.hide();
    }
  }

  static get $name() {
    return "ngb.modal.stack.service";
  }

  static get $inject() {
    return [NgbScrollbar.$name, NgZone.$name, ApplicationRef.$name, "$q"];
  }
}
