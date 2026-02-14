import type { IAugmentedJQuery, IComponentController, IComponentOptions } from "angular";
import { NgbAlertConfig } from "@/alert/ngb-alert-config.service"
import template from "@/alert/ngb-alert.component.html?raw"
import { ngbRunTransition } from "@/utils/animations"

export class NgbAlert implements IComponentController {
    protected animation?: boolean
    protected dismissible?: boolean
    protected type?: string
    protected closed?: () => void

    constructor(private $element: IAugmentedJQuery, private ngbAlertConfig: NgbAlertConfig) { }

    $onInit(): void {
        this.animation = this.animation ?? this.ngbAlertConfig.animation
        this.dismissible = this.dismissible ?? this.ngbAlertConfig.dismissible
        this.type = this.type ?? this.ngbAlertConfig.type
    }

    $postLink(): void {
        this.$element.addClass("d-block")
        this.$element.attr("role", "alert")
        this.$element.addClass("alert show")

        this.$element.toggleClass("fade", !!this.animation)
        this.$element.toggleClass("alert-dismissible", !!this.dismissible)
        this.$element.addClass(`alert-${this.type}`)
    }

    protected async closing() {
        await ngbRunTransition(this.$element, () => {
            this.$element.removeClass("show")
        })

        this.closed?.()
    }

    static get $name() {
        return "ngbAlert"
    }

    static get $inject() {
        return ["$element", NgbAlertConfig.$name]
    }

    static get $factory(): IComponentOptions {
        return {
            bindings: {
                animation: "<?",
                dismissible: "<?",
                type: "<?",
                closed: "&?"
            },
            transclude: true,
            controller: NgbAlert,
            controllerAs: "$",
            template
        }
    }
}
