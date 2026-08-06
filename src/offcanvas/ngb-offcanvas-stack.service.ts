import { NgbOffcanvasBackdrop } from "@ngb/offcanvas/ngb-offcanvas-backdrop.component";
import type { NgbOffcanvasOptions } from "@ngb/offcanvas/ngb-offcanvas-config.service";
import { NgbActiveOffcanvas, NgbOffcanvasRef } from "@ngb/offcanvas/ngb-offcanvas-ref";
import { NgbOffcanvasPanel } from "@ngb/offcanvas/ngb-offcanvas-panel.component";
import { NgbScrollbar } from "@ngb/ngb-scrollbar.service";
import { camelToKebabCase, toNativeElement } from "@ngb/utils";
import { ngbFocusTrap } from "@ngb/utils/focus-trap";
import { ContentRef } from "@ngb/utils/popup.service";
import angular, {
  type IAugmentedJQuery,
  type ICompileService,
  type IPromise,
  type IQService,
  type IRootScopeService,
} from "angular";
import { finalize, Subject } from "rxjs";
import { TemplateRef } from "ngjs-core";

type OffcanvasContentScope = angular.IScope & {
  activeOffcanvas: NgbActiveOffcanvas;
  [key: string]: any;
};

export class NgbOffcanvasStack {
  private _scrollBarRestoreFn: null | (() => void) = null;
  private _offcanvasRef?: NgbOffcanvasRef;
  private _panelRef?: ContentRef<NgbOffcanvasPanel>;

  private _activePanelCmptHasChanged = new Subject<void>();
  private _activeInstance = new Subject<NgbOffcanvasRef | undefined>();

  constructor(
    private ngbScrollbar: NgbScrollbar,
    private $compile: ICompileService,
    private $rootScope: IRootScopeService,
    private $q: IQService,
  ) {
    this._activePanelCmptHasChanged.subscribe(() => {
      if (this._panelRef) {
        ngbFocusTrap(toNativeElement(this._panelRef.$element), this._activePanelCmptHasChanged);
      }
    });
  }

  async open<T = any>(content: any, options: NgbOffcanvasOptions): Promise<NgbOffcanvasRef> {
    const offcanvas = this.$q.defer<NgbOffcanvasRef>();
    const container = this._resolveContainer(options.container);

    if (!container) {
      throw new Error(`The specified offcanvas container "${options.container || "body"}" was not found in the DOM.`);
    }

    if (!options.scroll) {
      this._hideScrollBar();
    }

    const activeOffcanvas = new NgbActiveOffcanvas();
    const contentRef = this._getContentRef<T>(content, activeOffcanvas, options);

    const backdropRef = options.backdrop !== false ? this._attachBackdrop(container) : undefined;

    await this.$q.all([backdropRef, contentRef]).then(([backdropRef, contentRef]) => {
      const panelRef = this._attachPanelComponent(container, contentRef.$element);

      return panelRef.then((panelRef) => {
        const ngbOffcanvasRef = new NgbOffcanvasRef(this.$q, panelRef, contentRef, backdropRef, options.beforeDismiss);

        activeOffcanvas.close = (result: any) => {
          ngbOffcanvasRef.close(result);
        };

        activeOffcanvas.dismiss = (reason: any) => {
          ngbOffcanvasRef.dismiss(reason);
        };

        if (panelRef.componentInstance) {
          this._applyPanelOptions(panelRef.componentInstance, options);
        }

        if (backdropRef?.componentInstance) {
          this._applyBackdropOptions(backdropRef.componentInstance, options);
        }

        this._registerOffcanvasRef(ngbOffcanvasRef);
        this._registerPanelRef(panelRef);

        ngbOffcanvasRef.hidden.pipe(finalize(() => this._restoreScrollBar())).subscribe();

        offcanvas.resolve(ngbOffcanvasRef);
      });
    });

    return offcanvas.promise;
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

  private _attachBackdrop(container: IAugmentedJQuery): IPromise<ContentRef<NgbOffcanvasBackdrop>> {
    const deferred = this.$q.defer<ContentRef<NgbOffcanvasBackdrop>>();
    const scope = this.$rootScope.$new(true);
    const linkFn = this.$compile("<ngb-offcanvas-backdrop></ngb-offcanvas-backdrop>");

    const compiled = linkFn(scope);
    container.append(compiled);

    const watcher = this.$rootScope.$watch(
      () => compiled.controller(NgbOffcanvasBackdrop.$name),
      (instance) => {
        watcher();

        const ref = new ContentRef(compiled, scope, instance);
        deferred.resolve(ref);
      },
    );

    return deferred.promise;
  }

  private _attachPanelComponent(
    container: IAugmentedJQuery,
    content: IAugmentedJQuery,
  ): IPromise<ContentRef<NgbOffcanvasPanel>> {
    const deferred = this.$q.defer<ContentRef<NgbOffcanvasPanel>>();
    const scope = this.$rootScope.$new(true);
    const linkFn = this.$compile("<ngb-offcanvas-panel></ngb-offcanvas-panel>");

    const compiled = linkFn(scope);
    compiled.append(content);

    container.append(compiled);

    const watcher = this.$rootScope.$watch(
      () => compiled.controller(NgbOffcanvasPanel.$name),
      (instance) => {
        watcher();

        const ref = new ContentRef(compiled, scope, instance);
        deferred.resolve(ref);
      },
    );

    return deferred.promise;
  }

  private _applyPanelOptions(panelInstance: NgbOffcanvasPanel, options: NgbOffcanvasOptions): void {
    panelInstance.updateOptions(options);
  }

  private _applyBackdropOptions(backdropInstance: NgbOffcanvasBackdrop, options: NgbOffcanvasOptions): void {
    backdropInstance.updateOptions(options);
    backdropInstance.static = options.backdrop === "static";
  }

  private _getContentRef<T>(content: any, activeOffcanvas: NgbActiveOffcanvas, options: NgbOffcanvasOptions) {
    const deferred = this.$q.defer<ContentRef<T>>();

    if (content instanceof TemplateRef) {
      const viewRef = content.createEmbeddedView({
        $implicit: activeOffcanvas,
        close: (result?: any) => activeOffcanvas.close(result),
        dismiss: (reason?: any) => activeOffcanvas.dismiss(reason),
      });
      deferred.resolve(new ContentRef<T>(angular.element(viewRef.rootNodes as any), undefined, undefined, viewRef));
      return deferred.promise;
    }

    const scope = this.$rootScope.$new(true) as OffcanvasContentScope;
    const componentName = camelToKebabCase(content);
    const attrs = this._buildBindingsAttrs(options);
    const linkFn = this.$compile(
      `<${componentName} ${attrs} ngb-active-offcanvas="activeOffcanvas"></${componentName}>`,
    );

    scope.activeOffcanvas = activeOffcanvas;
    angular.extend(scope, options.bindings);

    const compiled = linkFn(scope);

    const watcher = this.$rootScope.$watch(
      () => compiled.controller(content),
      (instance) => {
        watcher();

        const ref = new ContentRef(compiled, scope, instance);
        deferred.resolve(ref);
      },
    );

    return deferred.promise;
  }

  private _buildBindingsAttrs(options: NgbOffcanvasOptions) {
    return Object.keys(options.bindings || {})
      .map((key) => `${camelToKebabCase(key)}="${key}"`)
      .join(" ");
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

  private _registerPanelRef(panelRef: ContentRef<NgbOffcanvasPanel>) {
    this._panelRef = panelRef;
    this._activePanelCmptHasChanged.next();

    panelRef.$scope?.$on("$destroy", () => {
      this._panelRef = undefined;
      this._activePanelCmptHasChanged.next();
    });
  }

  static get $name() {
    return "ngb.offcanvas.stack.service";
  }

  static get $inject() {
    return [NgbScrollbar.$name, "$compile", "$rootScope", "$q"];
  }
}
