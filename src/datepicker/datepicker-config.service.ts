import { NgbConfig } from "@ngb/ngb-config.service";

export class NgbDatepickerConfig {
  static get $name() {
    return "datepicker.config.service";
  }

  static get $inject() {
    return [NgbConfig.$name];
  }
}
