import type { IAugmentedJQuery, IComponentController, IComponentOptions, IScope } from "angular";
import template from "@/progressbar/ngb-progressbar.component.html?raw"
import { NgbProgressbarConfig } from "@/progressbar/ngb-progressbar-config.service"
import type { NgbProgressbarStacked } from "@/progressbar/ngb-progressbar-stacked.component"
import { NgbHostSynchronizerFactory, type IHostSynchronizer } from "@/ngb-sync-host.factory"

export class NgbProgressbar implements IComponentController {
    protected animated?: boolean
    protected ariaLabel?: string
    protected height?: string
    protected max?: number
    protected showValue?: boolean
    protected striped?: boolean
    protected textType?: string
    protected type?: string
    protected value?: number
    protected ngbProgressbarStacked?: NgbProgressbarStacked

    private hostSynchronizer?: IHostSynchronizer

    constructor(
        private ngbProgressbarConfig: NgbProgressbarConfig,
        private $element: IAugmentedJQuery,
        private ngbSyncHostFactory: NgbHostSynchronizerFactory,
        private $scope: IScope
    ) { }

    $onInit(): void {
        this.animated = this.animated ?? this.ngbProgressbarConfig.animated
        this.ariaLabel = this.ariaLabel ?? this.ngbProgressbarConfig.ariaLabel
        this.height = this.height ?? this.ngbProgressbarConfig.height
        this.max = this.max ?? this.ngbProgressbarConfig.max
        this.showValue = this.showValue ?? this.ngbProgressbarConfig.showValue
        this.striped = this.striped ?? this.ngbProgressbarConfig.striped
        this.textType = this.textType ?? this.ngbProgressbarConfig.textType
        this.type = this.type ?? this.ngbProgressbarConfig.type
    }

    $postLink(): void {
        this.hostSynchronizer = this.ngbSyncHostFactory.$create(this.$element, this.$scope, {
            attributes: {
                "role": () => "progressbar",
                "aria-valuemin": () => 0,
                "aria-valuenow": () => this.value,
                "aria-label": () => this.ariaLabel,
                "aria-valuemax": () => this.max
            },
            classNames: {
                "progress": () => true,
                "mb-3": () => !this.isStacked
            },
            style: {
                "width": () => this.isStacked ? this.width : "100%"
            }
        })
    }

    protected get percent() {
        const value = Number(this.value ?? 0)
        const max = Number(this.max ?? this.ngbProgressbarConfig.max ?? 100)

        if (!Number.isFinite(max) || max <= 0) return "0%"

        const percent = (value * 100) / max
        const clamped = Math.min(100, Math.max(0, percent))

        return `${clamped}%`
    }

    protected get width() {
        if(this.isStacked) return "100%"
        return this.percent
    }

    protected get background() {
        return this.type ? `text-bg-${this.type}` : ""
    }

    protected get text() {
        return this.textType ? `text-${this.textType}` : ""
    }

    private get isStacked() {
        return Boolean(this.ngbProgressbarStacked)
    }

    $onDestroy(): void {
        this.hostSynchronizer?.$destroy()
    }

    static get $name() {
        return "ngbProgressbar"
    }

    static get $inject() {
        return [NgbProgressbarConfig.$name, "$element", NgbHostSynchronizerFactory.$name, "$scope"]
    }

    static get $factory(): IComponentOptions {
        return {
            bindings: {
                animated: "<?",
                ariaLabel: "@?",
                height: "@?",
                max: "<?",
                showValue: "<?",
                striped: "<?",
                textType: "@?",
                type: "@?",
                value: "<?"
            },
            require: {
                ngbProgressbarStacked: "^?ngbProgressbarStacked"
            },
            transclude: true,
            controller: NgbProgressbar,
            controllerAs: "$",
            template
        }
    }
}
