import type { IAugmentedJQuery, IComponentController, IComponentOptions, IOnChangesObject, IScope } from "angular";
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
    protected ngbProgressbarStacked?: NgbProgressbarStacked

    constructor(
        private ngbProgressbarConfig: NgbProgressbarConfig,
        private $element: IAugmentedJQuery,
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

    $onChanges(): void {
        if (!this.ngbProgressbarStacked) return
        debugger

        this.$element.attr("role", "progressbar")
        this.$element.addClass("progress")
        this.$element.attr("aria-valuemin", 0)
        this.$element.attr("aria-label", this.ariaLabel ?? this.ngbProgressbarConfig.ariaLabel)
        this.$element.attr("aria-valuemax", this.max ?? this.ngbProgressbarConfig.max)
        this.$element.attr("aria-valuenow", this.value ?? "0")

        this.$element.css({
            height: this.height ?? this.ngbProgressbarConfig.height ?? "100%",
            width: this.percent
        })
    }

    protected get percent() {
        if (!this.value || !this.max) {
            this.value = 0
            this.max = this.ngbProgressbarConfig.max
        }

        const percent = (this.value * 100) / this.max
        return `${percent}%`
    }

    protected get background() {
        return `text-bg-${this.type}`
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
