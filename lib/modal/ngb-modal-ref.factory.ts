import type { IDeferred, IQService, IScope } from "angular"
import { NgbModalCloseEvent } from "@/modal/ngb-modal.events"

export class ModalRef {
    private currentResult!: IDeferred<any>
    private currentComponentInstance!: any

    get componentInstance() {
        return this.currentComponentInstance
    }

    set componentInstance(instance) {
        this.currentComponentInstance = instance
    }

    get result() {
        return this.currentResult.promise
    }

    constructor(
        private scope: IScope,
        private $q: IQService,
    ) {
        this.currentResult = this.$q.defer()
        // Keep dismiss rejections handled by default (ng-bootstrap-like behavior).
        this.currentResult.promise.then(undefined, () => undefined)
    }

    public close(result: any) {
        this.currentResult.resolve(result)
        this.clear()
    }

    public dismiss(reason?: any) {
        this.currentResult.reject(reason)
        this.clear()
    }

    private clear() {
        this.scope.$emit(NgbModalCloseEvent, this.componentInstance)
    }
}

export class NgbModalRefFactory {
    constructor(private $q: IQService) { }

    public create(scope: IScope) {
        return new ModalRef(scope, this.$q)
    }

    static get $inject() {
        return ["$q"]
    }

    static get $name() {
        return "ngb.modalRef.factory"
    }
}
