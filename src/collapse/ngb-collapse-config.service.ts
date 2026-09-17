import { NgbConfig } from "@ngb/config/ngb-config";
import { Inject, Service } from "ngjs-core";

@Service({ id: "ngb.collapse.config.service" })
export class NgbCollapseConfig {
  private _ngbConfig: NgbConfig;
  private _animation?: boolean;

  horizontal = false;

  constructor(@Inject(NgbConfig) ngbConfig: NgbConfig) {
    this._ngbConfig = ngbConfig;
  }

  get animation(): boolean {
    return this._animation ?? this._ngbConfig.animation;
  }

  set animation(animation: boolean) {
    this._animation = animation;
  }
}
