import { NgbScrollbar } from "@ngb/ngb-scrollbar.service";
import { NgbOffcanvasBackdrop } from "@ngb/offcanvas/ngb-offcanvas-backdrop.component";
import type { NgbOffcanvasOptions } from "@ngb/offcanvas/ngb-offcanvas-config.service";
import { NgbOffcanvasPanel } from "@ngb/offcanvas/ngb-offcanvas-panel.component";
import { NgbActiveOffcanvas, NgbOffcanvasRef } from "@ngb/offcanvas/ngb-offcanvas-ref";
import { ngbFocusTrap } from "@ngb/utils/focus-trap";
import { ContentRef } from "@ngb/utils/popup.service";
import angular, { type IAugmentedJQuery, type IPromise, type IQService } from "angular";
import { ApplicationRef, type ComponentRef, createComponent, NgZone, TemplateRef } from "ngjs-core";
import { finalize, Subject } from "rxjs";

export class NgbOffcanvasStack {
  private _scrollBarRestoreFn: null | (() => void) = null;
  private _offcanvasRef?: NgbOffcanvasRef;
  private _panelRef?: ComponentRef<NgbOffcanvasPanel>;

  private _activePanelCmptHasChanged = new Subject<void>();
  private _activeInstance = new Subject<NgbOffcanvasRef | undefined>();

  constructor(
    private ngbScrollbar: NgbScrollbar,
    private _ngZone: NgZone,
    private _applicationRef: ApplicationRef,
    private $q: IQService,
  ) {
    this._activePanelCmptHasChanged.subscribe(() => {
      if (this._panelRef) {
        ngbFocusTrap(this._ngZone, this._panelRef.location.nativeElement, this._activePanelCmptHasChanged);
      }
    });
  }

  open<T = any>(content: any, options: NgbOffcanvasOptions): IPromise<NgbOffcanvasRef> {
    const container = this._resolveContainer(options.container);

    if (!container) {
      throw new Error(`The specified offcanvas container "${options.container || "body"}" was not found in the DOM.`);
    }

    if (!options.scroll) {
      this._hideScrollBar();
    }

    const activeOffcanvas = new NgbActiveOffcanvas();
    return this.$q
      .all({
        backdropRef:
          options.backdrop !== false
            ? this._attachBackdrop(container)
            : this.$q.resolve<ComponentRef<NgbOffcanvasBackdrop> | undefined>(undefined),
        contentRef: this._getContentRef<T>(content, activeOffcanvas, options),
      })
      .then(({ backdropRef, contentRef }) =>
        this._attachPanelComponent(container, contentRef).then((panelRef) => {
          const ngbOffcanvasRef = new NgbOffcanvasRef(
            this.$q,
            panelRef,
            contentRef,
            backdropRef,
            options.beforeDismiss,
          );

          activeOffcanvas.close = (result: any) => ngbOffcanvasRef.close(result);
          activeOffcanvas.dismiss = (reason: any) => ngbOffcanvasRef.dismiss(reason);

          this._applyPanelOptions(panelRef.instance, options);
          if (backdropRef) this._applyBackdropOptions(backdropRef.instance, options);

          this._registerOffcanvasRef(ngbOffcanvasRef);
          this._registerPanelRef(panelRef);
          ngbOffcanvasRef.hidden.pipe(finalize(() => this._restoreScrollBar())).subscribe();
          return ngbOffcanvasRef;
        }),
      );
  }

  get activeInstance() {
    return this._activeInstance.asObservable();
  }

  dismiss(reason?: any) {
    this._offcanvasRef?.dismiss(reason);
  }

  hasOpenOffcanvas(): boolean {
    return !!this._offcanvasRef;
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

  private _resolveContainer(container?: IAugmentedJQuery | string): IAugmentedJQuery | undefined {
    if (angular.isString(container)) {
      const native = document.querySelector(String(container));

      if (!native) return undefined;
      return angular.element(native);
    }

    return container ?? angular.element(document.body);
  }

  private _attachBackdrop(container: IAugmentedJQuery): IPromise<ComponentRef<NgbOffcanvasBackdrop>> {
    return this._createRootComponent<NgbOffcanvasBackdrop>(NgbOffcanvasBackdrop.$name).then((ref) => {
      container.append(angular.element(ref.location.nativeElement));
      return ref;
    });
  }

  private _attachPanelComponent(
    container: IAugmentedJQuery,
    contentRef: ContentRef,
  ): IPromise<ComponentRef<NgbOffcanvasPanel>> {
    return this._createRootComponent<NgbOffcanvasPanel>(NgbOffcanvasPanel.$name, {
      projectableNodes: contentRef.nodes,
    }).then((ref) => {
      container.append(angular.element(ref.location.nativeElement));
      return ref;
    });
  }

  private _applyPanelOptions(panelInstance: NgbOffcanvasPanel, options: NgbOffcanvasOptions): void {
    panelInstance.updateOptions(options);
  }

  private _applyBackdropOptions(backdropInstance: NgbOffcanvasBackdrop, options: NgbOffcanvasOptions): void {
    backdropInstance.updateOptions(options);
    backdropInstance.static = options.backdrop === "static";
  }

  private _getContentRef<T>(
    content: any,
    activeOffcanvas: NgbActiveOffcanvas,
    options: NgbOffcanvasOptions,
  ): IPromise<ContentRef<T>> {
    if (content instanceof TemplateRef) {
      const viewRef = content.createEmbeddedView({
        $implicit: activeOffcanvas,
        close: (result?: any) => activeOffcanvas.close(result),
        dismiss: (reason?: any) => activeOffcanvas.dismiss(reason),
      });
      this._applicationRef.attachView(viewRef);
      return this.$q.resolve(new ContentRef<T>([viewRef.rootNodes], viewRef));
    }

    return this._createRootComponent<T>(content, {
      bindings: {
        ...options.bindings,
        ngbActiveOffcanvas: activeOffcanvas,
      },
    }).then(
      (componentRef) =>
        new ContentRef<T>([[componentRef.location.nativeElement]], undefined, componentRef),
    );
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

  private _registerOffcanvasRef(ngbOffcanvasRef: NgbOffcanvasRef) {
    const unregisterOffcanvasRef = () => {
      this._offcanvasRef = undefined;
      this._activeInstance.next(this._offcanvasRef);
    };

    this._offcanvasRef = ngbOffcanvasRef;
    this._activeInstance.next(this._offcanvasRef);
    ngbOffcanvasRef.result?.then(unregisterOffcanvasRef, unregisterOffcanvasRef);
  }

  private _registerPanelRef(panelRef: ComponentRef<NgbOffcanvasPanel>) {
    this._panelRef = panelRef;
    this._activePanelCmptHasChanged.next();

    panelRef.onDestroy(() => {
      this._panelRef = undefined;
      this._activePanelCmptHasChanged.next();
    });
  }

  static get $name() {
    return "ngb.offcanvas.stack.service";
  }

  static get $inject() {
    return [NgbScrollbar.$name, NgZone.$name, ApplicationRef.$name, "$q"];
  }
}
