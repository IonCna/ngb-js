import type { IComponentOptions } from "angular"

export class ToastDemoComponent {
    public showHeaderToast = true
    public showTranscludedToast = true

    public onHeaderHidden() {
        this.showHeaderToast = false
    }

    public onTranscludedHidden() {
        this.showTranscludedToast = false
    }

    public reset() {
        this.showHeaderToast = true
        this.showTranscludedToast = true
    }

    static get $name() {
        return "ngbToastDemo"
    }

    static get $factory(): IComponentOptions {
        return {
            controllerAs: "$",
            controller: ToastDemoComponent,
            template: `
                <div class="vstack gap-3">
                    <div class="d-flex gap-2">
                        <button type="button" class="btn btn-outline-primary btn-sm" ng-click="$.reset()">Reset toasts</button>
                    </div>

                    <ngb-toast ng-if="$.showHeaderToast" header="Header por atributo" animation="false" ngb-hidden="$.onHeaderHidden()">
                        Body de toast con header por atributo.
                    </ngb-toast>

                    <ngb-toast ng-if="$.showTranscludedToast" animation="false" ngb-hidden="$.onTranscludedHidden()">
                        <div ngb-toast-header>
                            <strong>Header transcluido</strong>
                        </div>
                        Body de toast con header transcluido.
                    </ngb-toast>
                </div>
            `
        }
    }
}
