import type { ComponentRef, NgbModalOptions, NgbModalUpdatableOptions } from "@/modal/ngb-modal-config.service";
import { camelToKebabCase, toNativeElement } from "@/utils";
import angular, { type IAugmentedJQuery, type ICompileService, type IDocumentService, type IDeferred, type IQService, type IRootScopeService } from "angular";
import { NgbScrollbar } from "@/ngb-scrollbar.service"
import { NgbActiveModal, NgbModalRef } from "@/modal/ngb-modal-ref"
import type { NgbModalBackdrop } from "@/modal/ngb-modal-backdrop.component";
import type { NgbModalWindow } from "@/modal/ngb-modal-window.component";
import { ngbFocusTrap } from "@/utils/focus-trap";

const NGB_ACTIVE_WINDOW_HAS_CHANGE = "ngb:active:window:has:change"

export class NgbModalStack {
    private _scrollBarRestoreFn: null | (() => void) = null;
    private _modalRefs: NgbModalRef[] = [];
    private _windowRefs: ComponentRef<NgbModalWindow>[] = []
    private _ariaHiddenValues: Map<Element, string | null> = new Map();
    private _stopFocusTrap?: IDeferred<void>

    constructor(
        private $document: IDocumentService,
        private ngbScrollbar: NgbScrollbar,
        private $compile: ICompileService,
        private $rootScope: IRootScopeService,
        private $q: IQService
    ) {
        this.$rootScope.$on(NGB_ACTIVE_WINDOW_HAS_CHANGE, () => {
            this._stopFocusTrap?.resolve()

            if (!this._windowRefs.length) {
                this._revertAriaHidden()
                return
            }

            const activeWindowCmpt = this._windowRefs[this._windowRefs.length - 1]
            this._stopFocusTrap = this.$q.defer<void>()

            ngbFocusTrap(activeWindowCmpt.$element, this._stopFocusTrap.promise)
            this._revertAriaHidden()
            this._setAriaHidden(activeWindowCmpt.$element)
        })
    }

    public async open<T = any>(content: any, options: NgbModalOptions) {
        const modal = this.$q.defer<NgbModalRef>()
        const container = this._resolveContainer(options.container)

        if (!container) {
            throw new Error(`The specified modal container "${options.container || 'body'}" was not found in the DOM.`);
        }

        this._hideScrollBar()

        const activeModal = new NgbActiveModal()
        const contentRef = this._getContentRef<T>(content, activeModal, options)

        const backdropRef = options.backdrop ? this._attachBackdrop(container) : undefined
        const windowRef = this._attachWindowComponent(container)

        await this.$q.all([backdropRef, windowRef, contentRef]).then(([backdropRef, windowRef, contentRef]) => {
            const ngbModalRef = new NgbModalRef<T>(this.$q, windowRef, contentRef, backdropRef, options.beforeDismiss);

            activeModal.dismiss = (reason: any) => {
                ngbModalRef.dismiss(reason)
            }

            activeModal.update = (options: NgbModalUpdatableOptions) => {
                ngbModalRef.update(options)
            }

            ngbModalRef.update(options);
            this._registerModalRef(ngbModalRef)
            this._registerWindow(windowRef)

            ngbModalRef.hidden.then(() => {
                this.$q.resolve(true).then(() => {
                    if (this._modalRefs.length) return
                    this.$document.find("body").removeClass("modal-open")

                    this._restoreScrollBar()
                    this;
                })
            })

            modal.resolve(ngbModalRef)
        })

        return modal.promise
    }

    private _registerWindow(ngbWindow: ComponentRef<NgbModalWindow>) {
        this._windowRefs.push(ngbWindow)
        this.$rootScope.$emit(NGB_ACTIVE_WINDOW_HAS_CHANGE)

        ngbWindow.$scope.$on("$destroy", () => {
            const index = this._windowRefs.indexOf(ngbWindow)

            if (index > -1) {
                this._windowRefs.splice(index, 1)
                this.$rootScope.$emit(NGB_ACTIVE_WINDOW_HAS_CHANGE)
            }
        })
    }

    private _registerModalRef(ngbModalRef: NgbModalRef) {
        const unregisterModalRef = () => {
            const index = this._modalRefs.indexOf(ngbModalRef)

            if (index > -1) {
                this._modalRefs.splice(index, 1)
            }
        }

        this._modalRefs.push(ngbModalRef)
        ngbModalRef.result?.then(unregisterModalRef, unregisterModalRef)
    }

    private _resolveContainer(container?: IAugmentedJQuery | string) {
        if (angular.isString(container)) {
            const native = toNativeElement(this.$document).querySelector(
                String(container)
            )

            if (!native) return this.$document.find("body");
            return angular.element(native)
        }

        return container ?? this.$document.find("body")
    }

    private _attachBackdrop(container: IAugmentedJQuery) {
        const deferred = this.$q.defer<ComponentRef<NgbModalBackdrop>>()
        const scope = this.$rootScope.$new(true)
        const linkFn = this.$compile("<ngb-modal-backdrop></ng-modal-backdrop>")

        const compiled = linkFn(scope)
        container.append(compiled)

        const watcher = this.$rootScope.$watch(() => compiled.controller("ngbModalBackdrop"), instance => {
            watcher()

            deferred.resolve({
                $element: compiled,
                $scope: scope,
                componentInstance: instance
            })
        })

        return deferred.promise
    }

    private _attachWindowComponent(container: IAugmentedJQuery) {
        const deferred = this.$q.defer<ComponentRef<NgbModalWindow>>()
        const scope = this.$rootScope.$new(true)
        const linkFn = this.$compile(`<ngb-modal-window></ng-modal-window>`)

        const compiled = linkFn(scope)
        container.append(compiled)

        const watcher = this.$rootScope.$watch(() => compiled.controller("ngbModalWindow"), instance => {
            watcher()

            deferred.resolve({
                $element: compiled,
                $scope: scope,
                componentInstance: instance
            })
        })

        return deferred.promise
    }

    private _getContentRef<T>(content: any, activeModal: NgbActiveModal, options: NgbModalOptions) {
        const deferred = this.$q.defer<ComponentRef<T>>()
        const scope = this.$rootScope.$new(true)
        const linkFn = this.$compile(`<${camelToKebabCase(content)}></${camelToKebabCase(content)}>`)

        const compiled = linkFn(scope)

        if (options.scrollable) {
            compiled.addClass("component-host-scrollable")
        }

        const watcher = this.$rootScope.$watch(() => compiled.controller(content), instance => {
            watcher()

            deferred.resolve({
                $element: compiled,
                $scope: scope,
                componentInstance: instance
            })
        })

        return deferred.promise
    }

    private _setAriaHidden(element: IAugmentedJQuery) {
        const parent = element.parent()
        const body = this.$document.find("bind")

        if (!parent || parent == body) return;
        const native = toNativeElement(parent)

        Array.from(native.children, sibling => {
            const node = toNativeElement(element)
            if (sibling !== node && sibling.nodeName !== "SCRIPT") {
                this._ariaHiddenValues.set(sibling, sibling.getAttribute("aria-hidden"))
                sibling.setAttribute('aria-hidden', "true")
            }
        })

        this._setAriaHidden(
            angular.element(parent)
        )
    }

    private _revertAriaHidden() {
        this._ariaHiddenValues.forEach((value, element) => {
            if (value) {
                element.setAttribute("aria-hidden", value)
                return
            }

            element.removeAttribute("aria-hidden")
        })

        this._ariaHiddenValues.clear()
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
        return "ngb.modal.stack.service"
    }

    static get $inject() {
        return [
            "$document",
            NgbScrollbar.$name,
            "$compile",
            "$rootScope",
            "$q"
        ]
    }
}
