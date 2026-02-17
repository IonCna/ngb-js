import type { IAugmentedJQuery, IController, IDirective, IScope } from "angular";
import type { NgbAccordionItem } from "@/accordion/ngb-accordion-item.directive"

export class NgbAccordionToggle implements IController {
    protected ngbAccordionItem!: NgbAccordionItem

    constructor(
        private $element: IAugmentedJQuery,
        private $scope: IScope
    ) {}

    $postLink(): void {
        this.$element.attr("id", this.ngbAccordionItem.getToggleId())
        this.$element.attr("aria-controls", this.ngbAccordionItem.getCollapseId())

        const handler = () => this.$scope.$evalAsync(() => this.ngbAccordionItem.toggle())
        this.$element.on("click", handler)

        this.$scope.$on("$destroy", () => {
            this.$element.off("click", handler)
        })

        this.$scope.$watch(() => this.ngbAccordionItem["collapsed"], (collapsed) => {
            this.$element.attr("aria-expanded", `${!collapsed}`)
        })
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
                ngbAccordionItem: "^^ngbAccordionItem"
            },
            scope: true,
            restrict: "A"
        })
    }

    static get $inject() {
        return ["$element", "$scope"]
    }
}
