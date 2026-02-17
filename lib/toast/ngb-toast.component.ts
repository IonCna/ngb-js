import type { IAugmentedJQuery, IComponentController, IComponentOptions } from "angular";
import {} from "@/toast/ngb-toast-config.service"

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

    static get $factory(): IComponentOptions {
        return {
            controllerAs: "$",
            controller: NgbToast,
        }
    }
}