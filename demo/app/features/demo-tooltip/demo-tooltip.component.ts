import type { IComponentController, IComponentOptions } from "angular"
import template from "@demo/features/demo-tooltip/demo-tooltip.component.html"

export class DemoTooltipComponent implements IComponentController {
    animation = true
    disabled = false
    lastEvent = "—"

    toggleAnimation() { this.animation = !this.animation }
    toggleDisabled() { this.disabled = !this.disabled }
    onShown() { this.lastEvent = "shown" }
    onHidden() { this.lastEvent = "hidden" }

    static get $name() { return "ngbDemoTooltip" }

    static get $factory(): IComponentOptions {
        return {
            controller: DemoTooltipComponent,
            controllerAs: "$",
            template
        }
    }
}
