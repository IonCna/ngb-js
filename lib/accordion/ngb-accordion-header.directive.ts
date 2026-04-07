import type { IAugmentedJQuery, IController, IDirective } from "angular";

export class NgbAccordionHeader implements IController {

    constructor(private $element: IAugmentedJQuery) {}

    $postLink(): void {
        this.$element.addClass("accordion-header")
        this.$element.attr("role", "heading")
    }

    static get $name() {
        return "ngbAccordionHeader"
    }

    static get $inject() {
        return ["$element"]
    }

    static get $factory(): () => IDirective {
        return () => ({
            bindToController: true,
            controller: NgbAccordionHeader,
            restrict: "A",
            transclude: true,
            template: '<ng-transclude></ng-transclude>'
        })
    }
}