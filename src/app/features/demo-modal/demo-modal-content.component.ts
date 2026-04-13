import type { IComponentController, IComponentOptions } from "angular"
import template from "@demo/features/demo-modal/demo-modal-content.component.html?raw"

export class DemoModalContentComponent implements IComponentController {
    public name = ""
    // public activeModal: any
    // "ngbActiveModal"

    constructor() {}

    static get $name() {
        return "ngbDemoModalContent"
    }

    static get $inject() {
        return []
    }

    static get $factory(): IComponentOptions {
        return {
            controller: DemoModalContentComponent,
            controllerAs: "$",
            template
        }
    }
}
