import { NgbConfig } from "@ngb/ngb-config.service";
import type { PlacementArray } from "@ngb/utils/positioning";
import type { Options } from "@popperjs/core";

export class NgbTooltipConfig {
  private _animation?: boolean;
  public autoClose: boolean | "inside" | "outside" = true;
  public placement: PlacementArray = "auto";
  public popperOptions = (options: Partial<Options>) => options;
  public triggers = "hover focus";
  public container?: string;
  public disableTooltip = false;
  public tooltipClass?: string;
  public openDelay = 0;
  public closeDelay = 0;

  constructor(private $config: NgbConfig) {}

  get animation() {
    return this._animation ?? this.$config.animation;
  }

  set animation(value: boolean) {
    this._animation = value;
  }

  static get $inject() {
    return [NgbConfig.$name];
  }

  static get $name() {
    return "ngb.tooltip.config.service";
  }
}
