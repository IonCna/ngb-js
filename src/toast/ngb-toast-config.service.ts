import { NgbConfig } from "@ngb/ngb-config.service";
import { inject, Service } from "ngjs-core";

export interface NgbToastOptions {
  autohide?: boolean;
  delay?: number;
  ariaLive?: "polite" | "assertive";
}

@Service()
export class NgbToastConfig implements NgbToastOptions {
  private _ngbConfig = inject(NgbConfig);
  private _animation?: boolean;

  autohide = true;
  delay = 5000;
  ariaLive: "polite" | "assertive" = "polite";

  get animation(): boolean {
    return this._animation ?? this._ngbConfig.animation;
  }

  set animation(animation: boolean) {
    this._animation = animation;
  }
}
