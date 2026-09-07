import { NgbConfig } from "@ngb/ngb-config.service";
import type { PlacementArray } from "@ngb/utils/positioning";
import type { Options } from "@popperjs/core";
import { inject, Service } from "ngjs-core";

@Service()
export class NgbTooltipConfig {
  private _ngbConfig = inject(NgbConfig);
  private _animation?: boolean;

  autoClose: boolean | "inside" | "outside" = true;
  placement: PlacementArray = "auto";
  popperOptions = (options: Partial<Options>) => options;
  triggers = "hover focus";
  container?: string;
  disableTooltip = false;
  tooltipClass?: string;
  openDelay = 0;
  closeDelay = 0;

  get animation(): boolean {
    return this._animation ?? this._ngbConfig.animation;
  }

  set animation(animation: boolean) {
    this._animation = animation;
  }
}
