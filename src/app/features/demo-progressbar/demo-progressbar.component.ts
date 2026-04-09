import type { IComponentOptions } from "angular"
import template from "@demo/features/demo-progressbar/demo-progressbar.component.html?raw"

export class DemoProgressbarComponent {
    static get $name() {
        return "ngbDemoProgressbar"
    }

    static get $factory(): IComponentOptions {
        return {
            controller: DemoProgressbarComponent,
            controllerAs: "$",
            template
        }
    }
}
