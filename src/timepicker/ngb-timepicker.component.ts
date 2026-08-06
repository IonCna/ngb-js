import type { IAugmentedJQuery, IComponentController, IComponentOptions } from "angular";
import template from "@ngb/timepicker/ngb-timepicker.component.html";
// import { NgbTime } from "@ngb/timepicker/ngb-time"
// import { isInteger } from "@ngb/utils";
// import { NgbTimepickerConfig } from "@ngb/timepicker/ngb-timepicker-config.service";

export class NgbTimepicker implements IComponentController {
  constructor(private $element: IAugmentedJQuery) {}

  $postLink() {
    this.$element.css("font-size", "1rem");
  }

  static get $name() {
    return "ngbTimepicker";
  }

  static get $inject() {
    return ["$element"];
  }

  static get $factory(): IComponentOptions {
    return {
      controller: NgbTimepicker,
      controllerAs: "$",
      bindings: {
        meridian: "<?",
        spinners: "<?",
        seconds: "<?",
        hourStep: "<?",
        minuteStep: "<?",
        secondStep: "<?",
        readonlyInputs: "<?",
        size: "<?",
      },
      template,
    };
  }
}
