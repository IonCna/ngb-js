import { NgbModalBackdrop } from "@ngb/modal/ngb-modal-backdrop.component";
import type { NgbModalOptions, NgbModalUpdatableOptions } from "@ngb/modal/ngb-modal-config.service";
import { NgbActiveModal, NgbModalRef } from "@ngb/modal/ngb-modal-ref";
import { NgbModalWindow } from "@ngb/modal/ngb-modal-window.component";
import { NgbScrollbar } from "@ngb/ngb-scrollbar.service";
import { ngbFocusTrap } from "@ngb/utils/focus-trap";
import { ContentRef } from "@ngb/utils/popup.service";
import angular from "angular";
import {
  ApplicationRef,
  type ComponentRef,
  createComponent,
  EventEmitter,
  inject,
  Injector,
  NgZone,
  Service,
  TemplateRef,
} from "ngjs-core";
import { Subject, take } from "rxjs";

/**
 * ADAPTACIÓN (ver CORE_GAPS): upstream `NgbModalStack` es todo síncrono
 * (`createComponent` de Angular lo es). En `ngjs-core` `createComponent` es
 * asíncrono, así que `open()` y los `_attach*` devuelven `Promise`. La estructura
 * de upstream (backdrop + content + window + `NgbModalRef`) se conserva 1:1.
 * `NgbActiveModal` se pasa al componente de contenido por `bindings` en vez de
 * `Injector.create({ providers })`.
 */
@Service()
export class NgbModalStack {
  private _applicationRef = inject(ApplicationRef);
  private _scrollBar = inject(NgbScrollbar);
  private _ngZone = inject(NgZone);

  private _activeWindowCmptHasChanged = new Subject<void>();
  private _ariaHiddenValues = new Map<Element, string | null>();
  private _scrollBarRestoreFn: null | (() => void) = null;
  private _modalRefs: NgbModalRef[] = [];
  private _windowCmpts: ComponentRef<NgbModalWindow>[] = [];
  private _activeInstances = new EventEmitter<NgbModalRef[]>();

  constructor() {
    this._activeWindowCmptHasChanged.subscribe(() => {
      if (this._windowCmpts.length) {
        const activeWindowCmpt = this._windowCmpts[this._windowCmpts.length - 1];
        ngbFocusTrap(this._ngZone, activeWindowCmpt.location.nativeElement, this._activeWindowCmptHasChanged);
        this._revertAriaHidden();
        this._setAriaHidden(activeWindowCmpt.location.nativeElement);
      }
    });
  }

  open<T = unknown>(_contentInjector: Injector, content: unknown, options: NgbModalOptions): Promise<NgbModalRef<T>> {
    const containerEl = this._resolveContainer(options.container);
    if (!containerEl) {
      throw new Error(`The specified modal container "${options.container || "body"}" was not found in the DOM.`);
    }

    this._hideScrollBar();
    const activeModal = new NgbActiveModal();

    return Promise.all([
      options.backdrop !== false ? this._attachBackdrop(containerEl) : Promise.resolve(undefined),
      this._getContentRef(content, activeModal, options),
    ]).then(([backdropCmptRef, contentRef]) =>
      this._attachWindowComponent(containerEl, contentRef).then((windowCmptRef) => {
        const ngbModalRef = new NgbModalRef<T>(windowCmptRef, contentRef, backdropCmptRef, options.beforeDismiss);

        this._registerModalRef(ngbModalRef);
        this._registerWindowCmpt(windowCmptRef);

        ngbModalRef.hidden.pipe(take(1)).subscribe(() =>
          Promise.resolve(true).then(() => {
            if (!this._modalRefs.length) {
              document.body.classList.remove("modal-open");
              this._restoreScrollBar();
              this._revertAriaHidden();
            }
          }),
        );

        activeModal.close = (result: unknown) => ngbModalRef.close(result);
        activeModal.dismiss = (reason: unknown) => ngbModalRef.dismiss(reason);
        activeModal.update = (opts: NgbModalUpdatableOptions) => ngbModalRef.update(opts);

        ngbModalRef.update(options);
        if (this._modalRefs.length === 1) {
          document.body.classList.add("modal-open");
        }

        backdropCmptRef?.instance && backdropCmptRef.changeDetectorRef.detectChanges();
        windowCmptRef.changeDetectorRef.detectChanges();
        return ngbModalRef;
      }),
    );
  }

  get activeInstances() {
    return this._activeInstances;
  }

  dismissAll(reason?: unknown) {
    this._modalRefs.forEach((ngbModalRef) => ngbModalRef.dismiss(reason));
  }

  hasOpenModals(): boolean {
    return this._modalRefs.length > 0;
  }

  private _attachBackdrop(containerEl: Element): Promise<ComponentRef<NgbModalBackdrop>> {
    return this._createRootComponent<NgbModalBackdrop>(NgbModalBackdrop.$name).then((ref) => {
      containerEl.appendChild(ref.location.nativeElement);
      return ref;
    });
  }

  private _attachWindowComponent(
    containerEl: Element,
    contentRef: ContentRef,
  ): Promise<ComponentRef<NgbModalWindow>> {
    return this._createRootComponent<NgbModalWindow>(NgbModalWindow.$name, {
      projectableNodes: contentRef.nodes,
    }).then((ref) => {
      containerEl.appendChild(ref.location.nativeElement);
      return ref;
    });
  }

  private _getContentRef(
    content: unknown,
    activeModal: NgbActiveModal,
    options: NgbModalOptions,
  ): Promise<ContentRef> {
    if (!content) {
      return Promise.resolve(new ContentRef([]));
    }
    if (content instanceof TemplateRef) {
      const viewRef = content.createEmbeddedView({
        $implicit: activeModal,
        close: (result?: unknown) => activeModal.close(result),
        dismiss: (reason?: unknown) => activeModal.dismiss(reason),
      });
      this._applicationRef.attachView(viewRef);
      return Promise.resolve(new ContentRef([viewRef.rootNodes], viewRef));
    }
    // NOTA (adaptación): en ngb-js el contenido de tipo componente se pasa como
    // el NOMBRE registrado (string), no como clase — no hay caso de "string
    // literal como contenido" de upstream. Cualquier no-TemplateRef es un componente.
    return this._createRootComponent(content as string, {
      bindings: { ...(options.bindings as Record<string, unknown> | undefined), ngbActiveModal: activeModal },
    }).then((componentRef) => {
      if (options.scrollable) {
        angular
          .element(componentRef.location.nativeElement)
          .addClass("component-host-scrollable d-flex flex-column overflow-hidden");
      }
      return new ContentRef([[componentRef.location.nativeElement]], undefined, componentRef);
    });
  }

  private _createRootComponent<C>(
    component: string,
    options?: { projectableNodes?: Node[][]; bindings?: Record<string, unknown> },
  ): Promise<ComponentRef<C>> {
    return Promise.resolve(
      createComponent<C>(component, { environmentInjector: this._applicationRef.injector, ...options }),
    ).then((componentRef) => {
      try {
        this._applicationRef.attachView(componentRef.hostView);
        componentRef.changeDetectorRef.markForCheck();
      } catch (error) {
        componentRef.destroy();
        throw error;
      }
      componentRef.onDestroy(() => this._applicationRef.detachView(componentRef.hostView));
      return componentRef;
    });
  }

  private _resolveContainer(container?: string | HTMLElement): Element | undefined {
    if (container instanceof HTMLElement) return container;
    if (typeof container === "string") return document.querySelector(container) ?? undefined;
    return document.body;
  }

  private _setAriaHidden(element: Element) {
    const parent = element.parentElement;
    if (parent && element !== document.body) {
      Array.from(parent.children).forEach((sibling) => {
        if (sibling !== element && sibling.nodeName !== "SCRIPT") {
          this._ariaHiddenValues.set(sibling, sibling.getAttribute("aria-hidden"));
          sibling.setAttribute("aria-hidden", "true");
        }
      });
      this._setAriaHidden(parent);
    }
  }

  private _revertAriaHidden() {
    this._ariaHiddenValues.forEach((value, element) => {
      if (value) element.setAttribute("aria-hidden", value);
      else element.removeAttribute("aria-hidden");
    });
    this._ariaHiddenValues.clear();
  }

  private _registerModalRef(ngbModalRef: NgbModalRef) {
    const unregisterModalRef = () => {
      const index = this._modalRefs.indexOf(ngbModalRef);
      if (index > -1) {
        this._modalRefs.splice(index, 1);
        this._activeInstances.emit(this._modalRefs);
      }
    };
    this._modalRefs.push(ngbModalRef);
    this._activeInstances.emit(this._modalRefs);
    ngbModalRef.result?.then(unregisterModalRef, unregisterModalRef);
  }

  private _registerWindowCmpt(ngbWindowCmpt: ComponentRef<NgbModalWindow>) {
    this._windowCmpts.push(ngbWindowCmpt);
    this._activeWindowCmptHasChanged.next();

    ngbWindowCmpt.onDestroy(() => {
      const index = this._windowCmpts.indexOf(ngbWindowCmpt);
      if (index > -1) {
        this._windowCmpts.splice(index, 1);
        this._activeWindowCmptHasChanged.next();
      }
    });
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
      this._scrollBarRestoreFn = this._scrollBar.hide();
    }
  }

  static get $name() {
    return "ngb.modal.stack.service";
  }
}
