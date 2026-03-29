import type { IComponentOptions } from "angular"

export class ProgressbarDemoComponent {
    public value = 35
    public max = 100
    public showValue = true

    public dec() {
        this.value = Math.max(0, this.value - 10)
    }

    public inc() {
        this.value = Math.min(this.max, this.value + 10)
    }

    public toggleText() {
        this.showValue = !this.showValue
    }

    static get $name() {
        return "ngbProgressbarDemo"
    }

    static get $factory(): IComponentOptions {
        return {
            controllerAs: "$",
            controller: ProgressbarDemoComponent,
            template: `
                <div class="vstack gap-3">
                    <div class="d-flex gap-2 align-items-center flex-wrap">
                        <button type="button" class="btn btn-outline-secondary btn-sm" ng-click="$.dec()">-10</button>
                        <button type="button" class="btn btn-outline-secondary btn-sm" ng-click="$.inc()">+10</button>
                        <button type="button" class="btn btn-outline-primary btn-sm" ng-click="$.toggleText()">Toggle % text</button>
                        <span class="small text-muted">Valor: {{ $.value }} / {{ $.max }}</span>
                    </div>

                    <ngb-progressbar
                        value="$.value"
                        max="$.max"
                        type="primary"
                        text-type="white"
                        show-value="$.showValue"
                        striped="true"
                        animated="true">
                    </ngb-progressbar>

                    <ngb-progressbar-stacked>
                        <ngb-progressbar value="20" type="success" show-value="true"></ngb-progressbar>
                        <ngb-progressbar height="8px" value="30" type="warning" show-value="true"></ngb-progressbar>
                        <ngb-progressbar value="15" type="danger" show-value="true"></ngb-progressbar>
                    </ngb-progressbar-stacked>
                </div>
            `
        }
    }
}
