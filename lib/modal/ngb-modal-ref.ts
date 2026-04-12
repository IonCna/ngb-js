import type { NgbModalUpdatableOptions } from "@/modal/ngb-modal-config.service"
import type { IPromise, IQService } from "angular";
import angular from "angular";

export class NgbActiveModal {
    update(options: NgbModalUpdatableOptions): void { }
    close(result?: any): void { }
    dismiss(reason?: any): void { }
}

export class NgbModalRef {
    private _resolve?: (result?: any) => void;
    private _reject?: (reason?: any) => void;
    public result?: IPromise<any>;

    constructor(private $q: IQService) {
        const deferred = this.$q.defer()

        this.result = deferred.promise
        this._reject = deferred.reject
        this._resolve = deferred.resolve

        deferred.promise.then(angular.noop, angular.noop)
    }

	update(options: NgbModalUpdatableOptions): void {

    }

    get componentInstance() {
        return
    }
}
