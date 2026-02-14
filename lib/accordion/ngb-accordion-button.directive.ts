import type { IAugmentedJQuery, IController, IDirective } from "angular";

export class NgbAccordionButton implements IController {
    constructor(private $element: IAugmentedJQuery) {}

    $onInit(): void {
        
    }

    $postLink(): void {
        this.$element.addClass("accordion-button") // collapsed
        this.$element.attr("type", "button")
    }

    $onDestroy(): void {
        
    }

    static get $name() {
        return "ngbAccordionButton"
    }

    static get $inject() {
        return ["$element"]
    }

    static get $factory(): () => IDirective {
        return () => ({
            controller: NgbAccordionButton,
            bindToController: true,
            restrict: "A",
        })
    }
}