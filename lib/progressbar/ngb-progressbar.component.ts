import type { IAugmentedJQuery, IComponentController, IComponentOptions, IScope } from "angular";
import template from "@/progressbar/ngb-progressbar.component.html?raw"
import { NgbProgressbarConfig } from "@/progressbar/ngb-progressbar-config.service"
import type { NgbProgressbarStacked } from "@/progressbar/ngb-progressbar-stacked.component"

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

    private ngbProgressbarStacked?: NgbProgressbarStacked
    private cleanWatch?: () => void

    constructor(
        private ngbProgressbarConfig: NgbProgressbarConfig,
        private $element: IAugmentedJQuery,
        private $scope: IScope
    ) {}

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
        this.$element.addClass("progress")

        this.cleanWatch = this.$scope.$watchGroup(
            [() => this.value, () => this.max, () => this.ariaLabel, () => this.height],
            () => this.syncHostAttributes()
        )
    }

    $onDestroy(): void {
        this.cleanWatch?.()
    }

    protected get percent() {
        const max = this.maxValue
        if (max === 0) return "0%"

        const ratio = (this.currentValue / max) * 100
        return `${ratio}%`
    }

    protected get text() {
        return this.textType ? `text-${this.textType}` : ""
    }

    protected get displayValue() {
        return this.currentValue
    }

    protected get displayMax() {
        return this.maxValue
    }

    private get maxValue() {
        const value = Number(this.max ?? this.ngbProgressbarConfig.max)
        return Number.isFinite(value) && value > 0 ? value : 100
    }

    private get currentValue() {
        const value = Number(this.value ?? 0)

        if (!Number.isFinite(value)) return 0
        if (value < 0) return 0
        if (value > this.maxValue) return this.maxValue

        return value
    }

    private syncHostAttributes() {
        this.$element.attr("role", "progressbar")
        this.$element.attr("aria-valuemin", "0")
        this.$element.attr("aria-valuenow", `${this.currentValue}`)
        this.$element.attr("aria-valuemax", `${this.maxValue}`)
        this.$element.attr("aria-label", this.ariaLabel ?? "")

        if (this.height) {
            this.$element.css("height", this.height)
        } else {
            this.$element.css("height", "")
        }

        if (this.ngbProgressbarStacked) {
            this.$element.css("width", this.percent)
        } else {
            this.$element.css("width", "")
        }
    }

    static get $name() {
        return "ngbProgressbar"
    }

    static get $inject() {
        return [NgbProgressbarConfig.$name, "$element", "$scope"]
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
                ngbProgressbarStacked: "^?"
            },
            transclude: true,
            controller: NgbProgressbar,
            controllerAs: "$",
            template
        }
    }
}
