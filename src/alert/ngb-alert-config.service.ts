import { NgbConfig } from "@ngb/config/ngb-config";
import { Inject, Service } from "ngjs-core";

/** Defaults de `NgbAlert`. Paridad con `@ng-bootstrap` (`alert-config.ts`). */
@Service({ id: "ngb.alert.config.service" })
export class NgbAlertConfig {
  private readonly _config: NgbConfig;
  private _animation?: boolean;

  dismissible = true;
  type = "warning";

  constructor(@Inject(NgbConfig) config: NgbConfig) {
    this._config = config;
  }

  get animation(): boolean {
    return this._animation ?? this._config.animation;
  }

  set animation(animation: boolean) {
    this._animation = animation;
  }
}
