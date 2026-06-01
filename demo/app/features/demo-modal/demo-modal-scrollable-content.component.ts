import template from "@demo/features/demo-modal/demo-modal-scrollable-content.component.html";
import type { NgbActiveModal } from "@ngb";
import type { IComponentController, IComponentOptions } from "angular";

export class DemoModalScrollableContentComponent implements IComponentController {
  public ngbActiveModal!: NgbActiveModal;

  public items = Array.from({ length: 30 }, (_, index) => `Scrollable row ${index + 1}`);

  static get $name() {
    return "ngbDemoModalScrollableContent";
  }

  static get $factory(): IComponentOptions {
    return {
      controller: DemoModalScrollableContentComponent,
      controllerAs: "$",
      template,
      bindings: {
        ngbActiveModal: "<",
      },
    };
  }
}
