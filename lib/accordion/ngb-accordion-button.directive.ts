import type { IAugmentedJQuery, IController, IDirective, IScope } from "angular";
import type { NgbAccordion } from "@/accordion/ngb-accordion.directive"
import type { NgbAccordionItem } from "@/accordion/ngb-accordion-item.directive"

export class NgbAccordionButton implements IController {
    private item!: NgbAccordionItem
    private accordion!: NgbAccordion
    private clickHandler?: () => void
    private disableWatcher?: () => void
    private stateWatcher?: () => void

    constructor(
        private $element: IAugmentedJQuery,
        private $scope: IScope
    ) { }

    $postLink(): void {
        this.$element.attr("type", "button")
        this.$element.addClass("accordion-button")

        this.disableWatcher = this.$scope.$watch(() => this.item.disabled, value => {
            this.$element.prop("disabled", !!value)
        })

        this.stateWatcher = this.$scope.$watchGroup([
            () => this.item.collapsed,
            () => this.item.collapseId
        ], value => {
            const [collapsed, collapseId] = value

            this.$element.toggleClass("collapsed", !!collapsed)
            this.$element.attr("aria-controls", `${collapseId}`)
            this.$element.attr("aria-expanded", `${!collapsed}`)
        })

        this.clickHandler = () => this.$scope.$evalAsync(() => {
            if (this.item.disabled) return
            this.accordion.toggle(this.item.id)
        })

        this.$element.on("click", this.clickHandler)
    }

    $onDestroy(): void {
        if (this.clickHandler) {
            this.$element.off("click", this.clickHandler)
        }

        this.disableWatcher?.()
        this.stateWatcher?.()
    }

    static get $name() {
        return "ngbAccordionButton"
    }

    static get $inject() {
        return ["$element", "$scope"]
    }

    static get $factory(): () => IDirective {
        return () => ({
            controller: NgbAccordionButton,
            bindToController: true,
            restrict: "A",
            controllerAs: "$",
            require: {
                item: "^^ngbAccordionItem",
                accordion: "^^ngbAccordion"
            },
            scope: true
        })
    }
}
