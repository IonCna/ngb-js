import type { IComponentController, IComponentOptions } from "angular";
import template from "@demo/features/demo-collapse/demo-collapse.component.html?raw"

export class DemoCollapseComponent implements IComponentController {
    public firstCollapsed = true

    static get $name() {
        return "ngbDemoCollapse"
    }

    static get $factory(): IComponentOptions {
        return {
            controller: DemoCollapseComponent,
            controllerAs: "$",
            template
        }
    }
}
