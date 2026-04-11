import type { IAugmentedJQuery, IController, IDirective, IScope } from "angular";
import type { NgbAccordionItem } from "@/accordion/ngb-accordion-item.directive"
import type { NgbAccordion } from "@/accordion/ngb-accordion.directive";

export class NgbAccordionToggle implements IController {
    private item!: NgbAccordionItem
    private accordion!: NgbAccordion
    private clickHandler?: () => void
    private stateWatcher?: () => void

    constructor(
        private $element: IAugmentedJQuery,
        private $scope: IScope
    ) {}

    $postLink(): void {
        this.$element.attr("id", this.item.toggleId)
        this.$element.attr("aria-controls", this.item.collapseId)

        const watchers = [
            () => this.item.collapsed,
            () => this.item.collapseId,
            () => this.item.disabled
        ]

        this.stateWatcher = this.$scope.$watchGroup(watchers, value => {
            const [collapsed, collapseId] = value

            this.$element.toggleClass("collapsed", !!collapsed)
            this.$element.attr("aria-controls", `${collapseId}`)
            this.$element.attr("aria-expanded", `${!collapsed}`)
        })

        this.clickHandler = () => {
            if (!this.item.disabled) {
                this.accordion.toggle(this.item.id)
            }
        }

        this.$element.on("click", this.clickHandler)
    }

    $onDestroy(): void {
        if (this.clickHandler) {
            this.$element.off("click", this.clickHandler)
        }

        this.stateWatcher?.()
    }

    static get $name() {
        return "ngbAccordionToggle"
    }

    static get $factory(): () => IDirective {
        return () => ({
            bindToController: true,
            controller: NgbAccordionToggle,
            controllerAs: "$",
            require: {
                item: "^^ngbAccordionItem",
                accordion: "^^ngbAccordion"
            },
            scope: true,
            restrict: "A"
        })
    }

    static get $inject() {
        return ["$element", "$scope"]
    }
}
