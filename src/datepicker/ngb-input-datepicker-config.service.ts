import { NgbDatepickerConfig } from "@ngb/datepicker/ngb-datepicker-config.service.ts";
import type { PlacementArray } from "@ngb/utils/positioning";
import type { Options } from "@popperjs/core";

export class NgbInputDatepickerConfig extends NgbDatepickerConfig {
  autoClose: boolean | "inside" | "outside" = true;
  container: null | "body" = null;
  positionTarget?: string | HTMLElement;
  placement: PlacementArray = ["bottom-start", "bottom-end", "top-start", "top-end"];
  popperOptions = (options: Partial<Options>): Partial<Options> => options;
  restoreFocus: true | HTMLElement | string = true;

  static get $name() {
    return "ngb.input-datepicker-config.service";
  }
}
