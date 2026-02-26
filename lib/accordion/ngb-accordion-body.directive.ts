import type { IController, IDirective } from "angular";
import template from "@/accordion/ngb-accordion-body.directive.html?raw"

export class NgbAccordionBody implements IController {
    static get $name() {
        return "ngbAccordionBody"
    }

    static get $inject() {
        return []
    }

    static get $factory(): () => IDirective {
        return () => ({
            controller: NgbAccordionBody,
            bindToController: true,
            require: {
                ngbAccordionItem: "^^ngbAccordionItem"
            },
            restrict: "A",
            template,
            transclude: true,
            replace: true
        })
    }
}
