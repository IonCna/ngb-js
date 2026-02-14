import type { IDirective } from "angular";
import { NgbAccordionConfig } from "@/accordion/ngb-accordion-config.service"

export class NgbAccordionToggle implements IDirective {
    static get $name() {
        return "ngbAccordionToggle"
    }

    static get $factory(): () => IDirective {
        return () => ({
            bindToController: true,
            controller: NgbAccordionToggle,
            restrict: "A"
        })
    }

    static get $inject() {
        return [NgbAccordionConfig.$name]
    }
}
