import { NgbOffcanvasBackdrop } from "@ngb/offcanvas/ngb-offcanvas-backdrop.component";
import type { NgbOffcanvasOptions } from "@ngb/offcanvas/ngb-offcanvas-config.service";
import { NgbOffcanvasPanel } from "@ngb/offcanvas/ngb-offcanvas-panel.component";
import { NgbActiveOffcanvas, NgbOffcanvasRef } from "@ngb/offcanvas/ngb-offcanvas-ref";
import { NgbScrollbar } from "@ngb/ngb-scrollbar.service";
import { ngbFocusTrap } from "@ngb/utils/focus-trap";
import { ContentRef } from "@ngb/utils/popup.service";
import angular from "angular";
import {
  ApplicationRef,
  type ComponentRef,
  createComponent,
  inject,
  type Injector,
  NgZone,
  Service,
  TemplateRef,
} from "ngjs-core";
import { finalize, Subject } from "rxjs";

/**
 * ADAPTACIÓN (ver CORE_GAPS): upstream `NgbOffcanvasStack` es síncrono
 * (`createComponent` de Angular lo es). En `ngjs-core` `createComponent` es
 * async, así que `open()` y los `_attach*` devuelven `Promise`. La estructura de
 * upstream (backdrop + content + panel + `NgbOffcanvasRef`) se conserva 1:1.
 * `NgbActiveOffcanvas` se pasa al componente de contenido por `bindings`.
 */
@Service()
export class NgbOffcanvasStack {
  private _applicationRef = inject(ApplicationRef);
  private _scrollBar = inject(NgbScrollbar);
  private _ngZone = inject(NgZone);

  private _scrollBarRestoreFn: null | (() => void) = null;
  private _offcanvasRef?: NgbOffcanvasRef;
  private _panelRef?: ComponentRef<NgbOffcanvasPanel>;

  private _activePanelCmptHasChanged = new Subject<void>();
  private _activeInstance = new Subject<NgbOffcanvasRef | undefined>();

  constructor() {
    this._activePanelCmptHasChanged.subscribe(() => {
      if (this._panelRef) {
        ngbFocusTrap(this._ngZone, this._panelRef.location.nativeElement, this._activePanelCmptHasChanged);
      }
    });
  }

  open<T = unknown>(_contentInjector: Injector, content: unknown, options: NgbOffcanvasOptions): Promise<NgbOffcanvasRef<T>> {
    const container = this._resolveContainer(options.container);
    if (!container) {
      throw new Error(`The specified offcanvas container "${options.container || "body"}" was not found in the DOM.`);
    }

    if (!options.scroll) {
      this._hideScrollBar();
    }

    const activeOffcanvas = new NgbActiveOffcanvas();

    return Promise.all([
      options.backdrop !== false ? this._attachBackdrop(container) : Promise.resolve(undefined),
      this._getContentRef(content, activeOffcanvas, options),
    ]).then(([backdropRef, contentRef]) =>
      this._attachPanelComponent(container, contentRef).then((panelRef) => {
        const ngbOffcanvasRef = new NgbOffcanvasRef<T>(panelRef, contentRef, backdropRef, options.beforeDismiss);

        activeOffcanvas.close = (result: unknown) => ngbOffcanvasRef.close(result);
        activeOffcanvas.dismiss = (reason: unknown) => ngbOffcanvasRef.dismiss(reason);

        panelRef.instance.updateOptions(options);
        if (backdropRef) {
          backdropRef.instance.updateOptions(options);
          backdropRef.instance.static = options.backdrop === "static";
        }

        this._registerOffcanvasRef(ngbOffcanvasRef);
        this._registerPanelRef(panelRef);
        ngbOffcanvasRef.hidden.pipe(finalize(() => this._restoreScrollBar())).subscribe();

        backdropRef?.changeDetectorRef.detectChanges();
        panelRef.changeDetectorRef.detectChanges();
        return ngbOffcanvasRef;
      }),
    );
  }

  get activeInstance() {
    return this._activeInstance.asObservable();
  }

  dismiss(reason?: unknown) {
    this._offcanvasRef?.dismiss(reason);
  }

  hasOpenOffcanvas(): boolean {
    return !!this._offcanvasRef;
  }

  private _attachBackdrop(container: Element): Promise<ComponentRef<NgbOffcanvasBackdrop>> {
    return this._createRootComponent<NgbOffcanvasBackdrop>(NgbOffcanvasBackdrop.$name).then((ref) => {
      container.appendChild(ref.location.nativeElement);
      return ref;
    });
  }

  private _attachPanelComponent(
    container: Element,
    contentRef: ContentRef,
  ): Promise<ComponentRef<NgbOffcanvasPanel>> {
    return this._createRootComponent<NgbOffcanvasPanel>(NgbOffcanvasPanel.$name, {
      projectableNodes: contentRef.nodes,
    }).then((ref) => {
      container.appendChild(ref.location.nativeElement);
      return ref;
    });
  }

  private _getContentRef(
    content: unknown,
    activeOffcanvas: NgbActiveOffcanvas,
    options: NgbOffcanvasOptions,
  ): Promise<ContentRef> {
    if (!content) {
      return Promise.resolve(new ContentRef([]));
    }
    if (content instanceof TemplateRef) {
      const viewRef = content.createEmbeddedView({
        $implicit: activeOffcanvas,
        close: (result?: unknown) => activeOffcanvas.close(result),
        dismiss: (reason?: unknown) => activeOffcanvas.dismiss(reason),
      });
      this._applicationRef.attachView(viewRef);
      return Promise.resolve(new ContentRef([viewRef.rootNodes], viewRef));
    }
    return this._createRootComponent(content as string, {
      bindings: { ...(options.bindings as Record<string, unknown> | undefined), ngbActiveOffcanvas: activeOffcanvas },
    }).then((componentRef) => new ContentRef([[componentRef.location.nativeElement]], undefined, componentRef));
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

  private _resolveContainer(container?: angular.IAugmentedJQuery | string): Element | undefined {
    if (angular.isString(container)) {
      return document.querySelector(String(container)) ?? undefined;
    }
    if (container) {
      return (container as angular.IAugmentedJQuery)[0] as Element;
    }
    return document.body;
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
    return "ngb.offcanvas.stack.service";
  }
}
