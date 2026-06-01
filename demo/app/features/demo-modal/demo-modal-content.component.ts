import template from "@demo/features/demo-modal/demo-modal-content.component.html";
import type { NgbActiveModal } from "@ngb";
import type { IComponentController, IComponentOptions } from "angular";

export class DemoModalContentComponent implements IComponentController {
  public name = "";
  public activeModal!: NgbActiveModal;

  static get $name() {
    return "ngbDemoModalContent";
  }

  static get $inject() {
    return [];
  }

  static get $factory(): IComponentOptions {
    return {
      controller: DemoModalContentComponent,
      controllerAs: "$",
      template,
      bindings: {
        ngbActiveModal: "<",
      },
    };
  }
}
