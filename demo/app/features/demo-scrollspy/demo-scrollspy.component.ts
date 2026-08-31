import template from "@demo/features/demo-scrollspy/demo-scrollspy.component.html";
import type { IComponentController, IComponentOptions } from "angular";

export class DemoScrollSpyComponent implements IComponentController {
  public active = "";

  public onActiveChange(active: string) {
    this.active = active;
  }

  static get $name() {
    return "ngbDemoScrollspy";
  }

  static get $factory(): IComponentOptions {
    return {
      controller: DemoScrollSpyComponent,
      controllerAs: "$",
      template,
    };
  }
}
