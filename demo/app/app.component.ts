import template from "@demo/app.component.html";
import type { IComponentController, IComponentOptions } from "angular";

export class AppComponent implements IComponentController {
  static get $name() {
    return "ngbDemoApp";
  }

  static get $inject() {
    return [];
  }

  static get $factory(): IComponentOptions {
    return {
      controller: AppComponent,
      controllerAs: "$",
      template,
    };
  }
}
