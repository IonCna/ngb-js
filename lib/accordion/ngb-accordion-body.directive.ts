import type { IAugmentedJQuery, IController, IDirective } from "angular";
import type { NgbAccordionItem } from "@/accordion/ngb-accordion-item.directive";

export class NgbAccordionBody implements IController {
    protected item!: NgbAccordionItem

    constructor(private $element: IAugmentedJQuery) {}

    $postLink(): void {
        this.$element.addClass("accordion-body")
    }

    static get $name() {
        return "ngbAccordionBody"
    }

    static get $inject() {
        return ["$element"]
    }

    static get $factory(): () => IDirective {
        return () => ({
            controller: NgbAccordionBody,
            bindToController: true,
            controllerAs: "$",
            require: {
                item: "^^ngbAccordionItem"
            },
            scope: true,
            restrict: "A",
            transclude: true,
            template: `<ng-transclude ng-if="$.item._shouldBeInDOM"></ng-transclude>`,
        })
    }
}
