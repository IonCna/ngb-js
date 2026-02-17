import type { IAugmentedJQuery, IController, IDirective, IScope } from "angular";
import { NgbAccordionItemChange } from "@/accordion/ngb-accordion.events"
import { NgbAccordionItem } from "@/accordion/ngb-accordion-item.directive"
import template from "@/accordion/ngb-accordion-collapse.directive.html?raw"

export class NgbAccordionCollapse implements IController {
    protected ngbAccordionItem!: NgbAccordionItem
    protected shouldRender = true

    constructor(
        private $element: IAugmentedJQuery,
        private $scope: IScope
    ) { }

    $onInit(): void {
        this.shouldRender = !this.ngbAccordionItem["destroyOnHide"] || !this.ngbAccordionItem["collapsed"]

        this.$scope.$watch(
            () => this.ngbAccordionItem["collapsed"],
            (collapsed) => {
                if (!collapsed) this.shouldRender = true
            }
        )
    }

    $postLink(): void {
        this.$element.addClass("accordion-collapse")
        this.$element.attr("id", this.ngbAccordionItem.getCollapseId())
        this.$element.attr("aria-labelledby", this.ngbAccordionItem.getToggleId())
    }

    protected onHide() {
        if (this.ngbAccordionItem["destroyOnHide"]) {
            this.shouldRender = false
        }

        this.ngbAccordionItem["$scope"].$emit(NgbAccordionItemChange, {
            itemId: this.ngbAccordionItem.getId(),
            phase: "hidden"
        })
    }

    protected onShown() {
        this.ngbAccordionItem["$scope"].$emit(NgbAccordionItemChange, {
            itemId: this.ngbAccordionItem.getId(),
            phase: "shown"
        })
    }

    static get $name() {
        return "ngbAccordionCollapse"
    }

    static get $inject() {
        return ["$element", "$scope"]
    }

    static get $factory(): () => IDirective {
        return () => ({
            bindToController: true,
            scope: true,
            require: {
                ngbAccordionItem: "^ngbAccordionItem"
            },
            restrict: "A",
            transclude: true,
            controllerAs: "$",
            template,
            controller: NgbAccordionCollapse,
        })
    }
}
