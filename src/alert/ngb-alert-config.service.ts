import { NgbConfig } from "@ngb/config/ngb-config";
import { Injectable, inject } from "ngjs-core";

/** Defaults de `NgbAlert`. Paridad con `@ng-bootstrap` (`alert-config.ts`). */
@Injectable({ providedIn: "root" })
export class NgbAlertConfig {
  private readonly _config = inject(NgbConfig);
  private _animation: boolean;

  dismissible = true;
  type = "warning";

  get animation(): boolean {
    return this._animation ?? this._config.animation;
  }

  set animation(animation: boolean) {
    this._animation = animation;
  }
}
