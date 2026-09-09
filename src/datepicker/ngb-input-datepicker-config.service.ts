import { NgbDatepickerConfig } from "@ngb/datepicker/ngb-datepicker-config.service.ts";
import type { PlacementArray } from "@ngb/utils/positioning";
import type { Options } from "@popperjs/core";
import { Injectable } from "ngjs-core";

/**
 * A configuration service for the [`NgbDatepickerInput`](#/components/datepicker/api#NgbDatepicker) component.
 *
 * You can inject this service, typically in your root component, and customize the values of its properties in
 * order to provide default values for all the datepicker inputs used in the application.
 *
 * @since 5.2.0
 */
@Injectable({ providedIn: "root" })
export class NgbInputDatepickerConfig extends NgbDatepickerConfig {
  autoClose: boolean | "inside" | "outside" = true;
  container: null | "body" = null;
  positionTarget?: string | HTMLElement;
  placement: PlacementArray = ["bottom-start", "bottom-end", "top-start", "top-end"];
  popperOptions = (options: Partial<Options>) => options;
  restoreFocus: true | HTMLElement | string = true;
}
