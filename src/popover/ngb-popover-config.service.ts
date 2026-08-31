import { NgbConfig } from "@ngb/ngb-config.service";
import type { PlacementArray } from "@ngb/utils/positioning.ts";
import type { Options } from "@popperjs/core";

export class NgbPopoverConfig {
  private _animation?: boolean;

  autoClose: boolean | "inside" | "outside" = true;
  placement: PlacementArray = "auto";
  popperOptions = (options: Partial<Options>) => options;
  triggers = "click";
  container?: string;
  disablePopover = false;
  popoverClass?: string;

  openDelay = 0;
  closeDelay = 0;

  constructor(private _config: NgbConfig) {}

  get animation() {
    return this._animation ?? this._config.animation;
  }

  set animation(value: boolean) {
    this._animation = value;
  }

  static get $inject() {
    return [NgbConfig.$name];
  }

  static get $name() {
    return "ngb.popover-config.service";
  }
}
