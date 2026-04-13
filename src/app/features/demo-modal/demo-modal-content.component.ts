import type { IComponentController, IComponentOptions } from "angular"
import template from "@demo/features/demo-modal/demo-modal-content.component.html?raw"
import type { NgbActiveModal } from "@ngb"

export class DemoModalContentComponent implements IComponentController {
    public name = ""
    public activeModal!: NgbActiveModal

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
            template,
            bindings: {
                ngbActiveModal: "<"
            }
        }
    }
}
