import type { IComponentController, IComponentOptions } from "angular"
import template from "@/progressbar/ngb-progressbar-stacked.component.html?raw"

export class NgbProgressbarStacked implements IComponentController {
    static get $name() {
        return "ngbProgressbarStacked"
    }

    static get $inject() {
        return []
    }

    static get $factory(): IComponentOptions {
        return {
            controller: NgbProgressbarStacked,
            controllerAs: "$",
            transclude: true,
            template
        }
    }
}