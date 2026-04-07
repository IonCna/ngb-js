import type { IComponentController, IComponentOptions } from "angular";
import template from "@demo/features/demo-alert/demo-alert.component.html?raw"

export class DemoAlertComponent implements IComponentController {
    static get $name() {
        return "ngbDemoAlert"
    }

    static get $factory(): IComponentOptions {
        return {
            controller: DemoAlertComponent,
            controllerAs: "$",
            template
        }
    }
}