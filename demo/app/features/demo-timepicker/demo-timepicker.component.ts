import template from "@demo/features/demo-timepicker/demo-timepicker.component.html";
import type { IComponentOptions } from "angular";

export class DemoTimepickerComponent {
  disabled = false;

  toggleDisabled(): void {
    this.disabled = !this.disabled;
  }

  static get $name() {
    return "ngbDemoTimepicker";
  }

  static get $factory(): IComponentOptions {
    return {
      controller: DemoTimepickerComponent,
      controllerAs: "$",
      template,
    };
  }
}
