import type { IComponentController, IComponentOptions } from "angular";
import template from "@demo/features/demo-alert/demo-alert.component.html"

export class DemoAlertComponent implements IComponentController {
    animation = true
    dismissible = true

    toggleAnimation() {
        this.animation = !this.animation
    }

    toggleDismissible() {
        this.dismissible = !this.dismissible
    }

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