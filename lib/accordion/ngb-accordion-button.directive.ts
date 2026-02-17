import type { IAugmentedJQuery, IController, IDirective, IScope } from "angular";
import type { NgbAccordionItem } from "@/accordion/ngb-accordion-item.directive"

export class NgbAccordionButton implements IController {
    protected ngbAccordionItem!: NgbAccordionItem
    constructor(private $element: IAugmentedJQuery, private $scope: IScope) { }

    $postLink(): void {
        this.$element.addClass("accordion-button")
        this.$element.attr("type", "button")
        this.$element.attr("id", this.ngbAccordionItem.getToggleId())
        this.$element.attr("aria-controls", this.ngbAccordionItem.getCollapseId())

        const handler = () => this.$scope.$evalAsync(() => this.ngbAccordionItem.toggle())
        this.$element.on("click", handler)

        this.$scope.$on("$destroy", () => {
            this.$element.off("click", handler)
        })

        this.$scope.$watch(() => this.collapsed, (collapsed) => {
            this.$element.toggleClass("collapsed", collapsed)
            this.$element.attr("aria-expanded", `${!collapsed}`)
        })

        this.$scope.$watch(() => this.ngbAccordionItem["disabled"], (disabled) => {
            this.$element.attr("disabled", disabled ? "disabled" : null)
        })
    }

    private get collapsed() {
        return this.ngbAccordionItem["collapsed"] ?? false
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
            scope: true,
            restrict: "A",
            controllerAs: "$",
            require: {
                ngbAccordionItem: "^^ngbAccordionItem"
            },
        })
    }
}
