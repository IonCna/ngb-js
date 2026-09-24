import { NgbConfig } from "@ngb/config/ngb-config";
import { Injectable, inject } from "ngjs-core";

// biome-ignore lint/suspicious/noExplicitAny: API pública compatible con ng-bootstrap
export interface NgbNavChangeEvent<T = any> {
  nextId: T;
  preventDefault: () => void;
  activeId: T;
}

export interface NgbNavContentContext {
  $implicit: boolean;
}

@Injectable({ providedIn: "root" })
export class NgbNavConfig {
  private _ngbConfig = inject(NgbConfig);
  private _animation?: boolean;

  destroyOnHide = true;
  orientation: "horizontal" | "vertical" = "horizontal";
  roles: "tablist" | false = "tablist";
  keyboard: boolean | "changeWithArrows" = true;

  get animation(): boolean {
    return this._animation ?? this._ngbConfig.animation;
  }

  set animation(animation: boolean) {
    this._animation = animation;
  }
}
