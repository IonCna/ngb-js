import type { IComponentController, IComponentOptions } from "angular"
import template from "@demo/features/demo-modal/demo-modal-content.component.html?raw"

export class DemoModalContentComponent implements IComponentController {
    public name = ""

    constructor(public activeModal: any) {}

    static get $name() {
        return "ngbDemoModalContent"
    }

    static get $inject() {
        return ["ngbActiveModal"]
    }

    static get $factory(): IComponentOptions {
        return {
            controller: DemoModalContentComponent,
            controllerAs: "$",
            template
        }
    }
}
