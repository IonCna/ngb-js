import type { IAugmentedJQuery, IController, IDirective } from "angular";

export class NgbAccordionBody implements IController {

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
            require: {
                ngbAccordionItem: "^^ngbAccordionItem"
            },
            restrict: "A",
            template: '<ng-transclude></ng-transclude>',
            transclude: true,
        })
    }
}
