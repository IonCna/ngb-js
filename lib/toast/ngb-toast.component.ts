import type { IAugmentedJQuery, IComponentController } from "angular";

export class NgbToast implements IComponentController {
    constructor(private $element: IAugmentedJQuery) {}

    $postLink(): void {
        this.$element.attr("role", "alert")
        this.$element.attr("aria-atomic", "true")
        this.$element.addClass("toast show")

        // if animation fade
    }

    static get $name() {
        return "ngbToast"
    }

    static get $inject() {
        return ["$element"]
    }
}