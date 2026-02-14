import type { IAugmentedJQuery, IComponentController, IComponentOptions } from "angular";
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
    protected value!: number

    private ngbProgressbarStacked?: NgbProgressbarStacked

    constructor(private ngbProgressbarConfig: NgbProgressbarConfig, private $element: IAugmentedJQuery) {}

    $onInit(): void {
        this.value = this.value ?? 0
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
        this.$element.attr("role", "progressbar")
        this.$element.attr("aria-valuemin", "0")
        this.$element.attr("type", this.type ?? "warning")
        this.$element.addClass("progress")
        this.$element.attr("aria-valuenow", this.value)
        this.$element.attr("aria-valuemax", this.max ?? 100)
        this.$element.attr("aria-label", this.ariaLabel ?? "")

        if(this.height) {
            this.$element.css("height", this.height)
        }

        if(this.ngbProgressbarStacked) {
            this.$element.css("width", this.percent)
        }
    }

    protected get percent() {
        return `${this.value}%`
    }

    protected get heightPx() {
        return `${this.height ?? 0}px`
    }

    protected get text() {
        return `text-${this.textType}`
    }

    static get $name() {
        return "ngbProgressbar"
    }

    static get $inject() {
        return [NgbProgressbarConfig.$name, '$element']
    }

    static get $factory(): IComponentOptions {
        return {
            bindings: {
                animated: "<?",
                ariaLabel: "<?",
                height: "<?",
                max: "<?",
                showValue: "<?",
                striped: "<?",
                textType: "<?",
                type: "<?",
                value: "<"
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