export class NgbTimepickerConfig {
  meridian = false;
  spinners = true;
  seconds = false;
  hourStep = 1;
  minuteStep = 1;
  secondStep = 1;
  disabled = false;
  readonlyInputs = false;
  size: "small" | "medium" | "large" = "medium";

  static get $name() {
    return "ngb.timepicker.config.service";
  }

  static get $inject() {
    return [];
  }
}
