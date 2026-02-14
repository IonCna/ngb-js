import type { IAugmentedJQuery, IController, IDirective } from "angular";

export class NgbAccordionCollapse implements IController {
    constructor(private $element: IAugmentedJQuery) { }

    $postLink(): void {
        this.$element.addClass("accordion-collapse collapse show")
    }

    static get $name() {
        return "ngbAccordionCollapse"
    }

    static get $inject() {
        return ["$element"]
    }

    static get $factory(): () => IDirective {
        return () => ({
            controller: NgbAccordionCollapse,
            bindToController: true,
            restrict: "A",
        })
    }
}