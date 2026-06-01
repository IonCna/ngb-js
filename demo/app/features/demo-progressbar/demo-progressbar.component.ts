import template from "@demo/features/demo-progressbar/demo-progressbar.component.html";
import type { IComponentOptions } from "angular";

export class DemoProgressbarComponent {
  static get $name() {
    return "ngbDemoProgressbar";
  }

  static get $factory(): IComponentOptions {
    return {
      controller: DemoProgressbarComponent,
      controllerAs: "$",
      template,
    };
  }
}
