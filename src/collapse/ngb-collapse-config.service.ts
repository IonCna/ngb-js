import { NgbConfig } from "@ngb/config/ngb-config";
import { Injectable, inject } from "ngjs-core";

@Injectable({ providedIn: "root" })
export class NgbCollapseConfig {
  private _ngbConfig = inject(NgbConfig);
  private _animation?: boolean;

  horizontal = false;

  get animation(): boolean {
    return this._animation ?? this._ngbConfig.animation;
  }

  set animation(animation: boolean) {
    this._animation = animation;
  }
}
