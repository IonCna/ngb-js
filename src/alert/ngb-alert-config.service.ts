import { NgbConfig } from "@ngb/ngb-config.service";
import { inject, Service } from "ngjs-core";

/** Defaults de `NgbAlert`. Paridad con `@ng-bootstrap` (`alert-config.ts`). */
@Service()
export class NgbAlertConfig {
  private readonly _config = inject(NgbConfig);
  private _animation?: boolean;

  dismissible = true;
  type = "warning";

  get animation(): boolean {
    return this._animation ?? this._config.animation;
  }

  set animation(animation: boolean) {
    this._animation = animation;
  }
}
