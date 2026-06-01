import template from "@demo/features/demo-collapse/demo-collapse.component.html";
import type { IComponentController, IComponentOptions } from "angular";

export class DemoCollapseComponent implements IComponentController {
  public firstCollapsed = true;
  public isMenuCollapsed = true;

  static get $name() {
    return "ngbDemoCollapse";
  }

  static get $factory(): IComponentOptions {
    return {
      controller: DemoCollapseComponent,
      controllerAs: "$",
      template,
    };
  }
}
