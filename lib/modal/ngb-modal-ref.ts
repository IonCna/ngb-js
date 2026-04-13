import type { ComponentRef, NgbModalUpdatableOptions } from "@/modal/ngb-modal-config.service"
import type { IDeferred, IPromise, IQService } from "angular";
import angular from "angular";
import type { NgbModalBackdrop } from "./ngb-modal-backdrop.component";
import type { NgbModalWindow } from "./ngb-modal-window.component";

export class NgbActiveModal {
    update(options: NgbModalUpdatableOptions): void { }
    close(result?: any): void { }
    dismiss(reason?: any): void { }
}

export class NgbModalRef<T = any> {
    private _resolve?: (result?: any) => void;
    private _reject?: (reason?: any) => void;

    public result?: IPromise<any>;

    private _hidden!: IDeferred<void>
    private _dismissed!: IDeferred<void>
    private _closed!: IDeferred<void>

    constructor(
        private $q: IQService,
        private windowRef: ComponentRef<NgbModalWindow>,
        private contentRef: ComponentRef<T>,
        private backdropRef?: ComponentRef<NgbModalBackdrop>,
        private _beforeDismiss?: () => boolean | Promise<boolean>,
    ) {
        const deferred = this.$q.defer()

        this.result = deferred.promise
        this._reject = deferred.reject
        this._resolve = deferred.resolve

        deferred.promise.then(angular.noop, angular.noop)
        this._hidden = this.$q.defer()
    }

    update(options: NgbModalUpdatableOptions): void {

    }

    dismiss(reason: any) {
        if (!this.windowRef) return
        if (!this._beforeDismiss) {
            this.dismiss(reason)
            return
        }

        const dismiss = this._beforeDismiss();
    }

    close(result: any) { }

    get closed() {

        // check
        return this._closed.promise.then(value => {
            return value
        })
    }

    get dismissed() {
        return this._dismissed.promise
    }

    get hidden() {
        return this._hidden.promise
    }

    get componentInstance() {
        return
    }

    private _removeModalElements() {
        const windowTransition = this.windowRef.componentInstance.hide()
        const backdropTransition = this.backdropRef?.componentInstance.hide()

        windowTransition.then(() => {
            this.windowRef.$element.remove()
            this.windowRef.$scope.$destroy()

            this.contentRef.$scope.$destroy()
            this.windowRef = <any>null
            this.contentRef = <any>null
        })

        backdropTransition?.then(() => {
            if (!this.backdropRef) return
            this.backdropRef.$element.remove()
            this.backdropRef.$scope.$destroy()
            this.backdropRef = <any>null
        })

        this.$q.all([windowTransition, backdropTransition]).then(() => {
            this._hidden.resolve()
        })
    }
}
