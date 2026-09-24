import { NgbConfig } from "@ngb/config/ngb-config";
import { Injectable, inject } from "ngjs-core";

export interface NgbToastOptions {
  autohide?: boolean;
  delay?: number;
  ariaLive?: "polite" | "alert";
}

@Injectable({ providedIn: "root" })
export class NgbToastConfig implements NgbToastOptions {
  private _ngbConfig = inject(NgbConfig);
  private _animation: boolean;

  autohide = true;
  delay = 5000;
  ariaLive: "polite" | "alert" = "polite";

  get animation(): boolean {
    return this._animation ?? this._ngbConfig.animation;
  }

  set animation(animation: boolean) {
    this._animation = animation;
  }
}
