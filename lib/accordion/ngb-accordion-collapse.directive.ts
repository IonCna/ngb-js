import type { IAugmentedJQuery, IController, IDirective } from "angular";
import { NgbAccordionItem } from "@/accordion/ngb-accordion-item.directive"
import template from "@/accordion/ngb-accordion-collapse.directive.html?raw"

export class NgbAccordionCollapse implements IController {
    protected ngbAccordionItem!: NgbAccordionItem
    constructor(private $element: IAugmentedJQuery) { }

    $postLink(): void {
        this.$element.addClass("accordion-collapse")
    }

    static get $name() {
        return "ngbAccordionCollapse"
    }

    static get $inject() {
        return ["$element"]
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