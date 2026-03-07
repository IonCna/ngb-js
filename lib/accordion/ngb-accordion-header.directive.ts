import type { IController, IDirective } from "angular";
import template from "@/accordion/ngb-accordion-header.directive.html?raw"

export class NgbAccordionHeader implements IController {
    static get $name() {
        return "ngbAccordionHeader"
    }

    static get $inject() {
        return []
    }

    static get $factory(): () => IDirective {
        return () => ({
            bindToController: true,
            controller: NgbAccordionHeader,
            restrict: "A",
            replace: true,
            transclude: true,
            template
        })
    }
}