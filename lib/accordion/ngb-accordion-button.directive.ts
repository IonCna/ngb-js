import type { IController, IDirective } from "angular";
import type { NgbAccordionItem } from "@/accordion/ngb-accordion-item.directive"
import template from "@/accordion/ngb-accordion-button.directive.html?raw"

export class NgbAccordionButton implements IController {
    protected ngbAccordionItem!: NgbAccordionItem

    protected get collapsed() {
        return this.ngbAccordionItem["collapsed"] ?? false
    }

    protected get disabled() {
        return this.ngbAccordionItem["disabled"] ?? false
    }

    static get $name() {
        return "ngbAccordionButton"
    }

    static get $inject() {
        return []
    }

    static get $factory(): () => IDirective {
        return () => ({
            controller: NgbAccordionButton,
            bindToController: true,
            scope: true,
            replace: true,
            transclude: true,
            restrict: "A",
            controllerAs: "$",
            template,
            require: {
                ngbAccordionItem: "^^ngbAccordionItem"
            },
        })
    }
}
