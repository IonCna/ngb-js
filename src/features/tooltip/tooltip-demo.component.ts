import type { IComponentOptions } from "angular"

export class TooltipDemoComponent {
    public tooltipText = "Tooltip en hover"
    public tooltipDisabled = false

    public toggleDisabled() {
        this.tooltipDisabled = !this.tooltipDisabled
    }

    static get $name() {
        return "ngbTooltipDemo"
    }

    static get $factory(): IComponentOptions {
        return {
            controllerAs: "$",
            controller: TooltipDemoComponent,
            template: `
                <div class="vstack gap-2">
                    <div class="d-flex gap-2 flex-wrap">
                        <button
                            type="button"
                            class="btn btn-outline-secondary btn-sm"
                            ngb-tooltip="$.tooltipText"
                            open-delay="0"
                            close-delay="0"
                            animation="false">
                            Hover tooltip
                        </button>

                        <button
                            type="button"
                            class="btn btn-outline-primary btn-sm"
                            ngb-tooltip="'Tooltip por click'"
                            triggers="'click'"
                            open-delay="0"
                            close-delay="0"
                            animation="false"
                            container="'body'">
                            Click tooltip
                        </button>

                        <button
                            type="button"
                            class="btn btn-outline-danger btn-sm"
                            ngb-tooltip="'Tooltip deshabilitable'"
                            disable-tooltip="$.tooltipDisabled"
                            open-delay="0"
                            close-delay="0"
                            animation="false">
                            Condicional
                        </button>
                    </div>

                    <button type="button" class="btn btn-sm btn-outline-dark align-self-start" ng-click="$.toggleDisabled()">
                        {{ $.tooltipDisabled ? 'Habilitar' : 'Deshabilitar' }} tooltip condicional
                    </button>
                </div>
            `
        }
    }
}
