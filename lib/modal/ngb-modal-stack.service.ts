import type { NgbModalOptions } from "@/modal/ngb-modal-config.service";
import { camelToKebabCase, toNativeElement } from "@/utils";
import angular, { type IAugmentedJQuery, type ICompileService, type IDocumentService, type IRootScopeService } from "angular";
import { NgbScrollbar } from "@/ngb-scrollbar.service"
import { NgbActiveModal, NgbModalRef } from "@/modal/ngb-modal-ref"

export class NgbModalStack {
    private _scrollBarRestoreFn: null | (() => void) = null;
	private _modalRefs: NgbModalRef[] = [];

    constructor(
        private $document: IDocumentService,
        private ngbScrollbar: NgbScrollbar,
        private $compile: ICompileService,
        private $rootScope: IRootScopeService
    ) { }

    public open(content: any, options: NgbModalOptions) {
        const container = this._resolveContainer(options.container)

        if (!container) {
            throw new Error(`The specified modal container "${options.container || 'body'}" was not found in the DOM.`);
        }

        this._hideScrollBar()

        const activeModal = new NgbActiveModal()
        debugger
    }

    private _registerModalRef(ngbModalRef: NgbModalRef) {
        const unregisterModalRef = () => {
            const index = this._modalRefs.indexOf(ngbModalRef)

            if(index > -1) {
                this._modalRefs.splice(index, 1)
            }
        }
        
        this._modalRefs.push(ngbModalRef)
        ngbModalRef
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
        const scope = this.$rootScope.$new(true)
        const linkFn = this.$compile("<ngb-modal-backdrop></ng-modal-backdrop>")

        const compiled = linkFn(scope)
        container.append(compiled)

        return scope
    }

    private _attachWindowComponent(container: IAugmentedJQuery, content: any) {
        const scope = this.$rootScope.$new(true)
        const componentName = camelToKebabCase(content)

        return () => {
            const linkFn = this.$compile(`<ngb-modal-window> <${componentName}></${componentName}> </ng-modal-window>`)

            const compiled = linkFn(scope)
            container.append(compiled)

            return scope
        }
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
            "$rootScope"
        ]
    }
}