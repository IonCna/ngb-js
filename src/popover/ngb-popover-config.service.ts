import { NgbConfig } from "@ngb/ngb-config.service";
import type { PlacementArray } from "@ngb/utils/positioning";
import type { Options } from "@popperjs/core";
import { inject, Service } from "ngjs-core";

/** Defaults for `NgbPopover`. Parity with `@ng-bootstrap` (`popover-config.ts`). */
@Service({ id: "ngb.popover.config.service" })
export class NgbPopoverConfig {
  private readonly _config = inject(NgbConfig);
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

  get animation(): boolean {
    return this._animation ?? this._config.animation;
  }

  set animation(value: boolean) {
    this._animation = value;
  }
}
