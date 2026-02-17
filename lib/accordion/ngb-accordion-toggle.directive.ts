import type { IAugmentedJQuery, IController, IDirective, IScope } from "angular";
import type { NgbAccordionItem } from "@/accordion/ngb-accordion-item.directive"

export class NgbAccordionToggle implements IController {
    protected ngbAccordionItem!: NgbAccordionItem
    private clickHandler?: () => void

    constructor(
        private $element: IAugmentedJQuery,
        private $scope: IScope
    ) {}

    $postLink(): void {
        this.$element.attr("id", this.ngbAccordionItem.getToggleId())
        this.$element.attr("aria-controls", this.ngbAccordionItem.getCollapseId())

        this.clickHandler = () => this.$scope.$evalAsync(() => this.ngbAccordionItem.toggle())
        this.$element.on("click", this.clickHandler.bind(this))

        this.$scope.$watch(() => this.ngbAccordionItem["collapsed"], (collapsed) => {
            this.$element.attr("aria-expanded", `${!collapsed}`)
        })
    }

    $onDestroy(): void {
        this.$element.off("click", this.clickHandler!.bind(this))
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
