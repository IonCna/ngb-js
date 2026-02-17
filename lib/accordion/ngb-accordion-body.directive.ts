import type { IAugmentedJQuery, ICompileService, IController, IDirective, IScope } from "angular";
import type { NgbAccordionItem } from "@/accordion/ngb-accordion-item.directive"

export class NgbAccordionBody implements IController {
    private ngbAccordionItem!: NgbAccordionItem
    private template?: HTMLTemplateElement

    private built = false
    private viewScope?: IScope
    private viewNodes?: JQLite

    constructor(
        private $element: IAugmentedJQuery
    ) { }

    $postLink(): void {
        this.$element.addClass("accordion-body")
    }


    static get $name() {
        return "ngbAccordionBody"
    }

    static get $inject() {
        return ["$element", "$scope"]
    }

    static get $factory(): () => IDirective {
        return () => ({
            controller: NgbAccordionBody,
            bindToController: true,
            require: {
                ngbAccordionItem: "^^ngbAccordionItem"
            },
            restrict: "A",
        })
    }
}
