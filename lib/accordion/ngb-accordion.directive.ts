import type { IAugmentedJQuery, IController, IDirective } from "angular";

export class NgbAccordion implements IController {
    constructor(private $element: IAugmentedJQuery) { }

    $postLink(): void {
        this.$element.addClass("accordion")
    }

    static get $name() {
        return "ngbAccordion"
    }

    static get $factory(): () => IDirective {
        return () => ({
            bindToController: true,
            controller: NgbAccordion,
            restrict: "A",
            scope: {
                animation: "<?",
                closeOthers: "<?",
                destroyOnHide: "<?",
                hidden: "&?",
                hide: "&?",
                show: "&?",
                shown: "&?"
            }
        })
    }

    static get $inject() {
        return ["$element"]
    }
}
