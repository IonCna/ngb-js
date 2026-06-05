import { NgbConfig } from "@ngb/ngb-config.service";

export interface NgbNavChangeEvent<T = any> {
  nextId: T;
  preventDefault: () => void;
  activeId: T;
}

export class NgbNavConfig {
  private _animation?: boolean;

  public destroyOnHide = true;
  public orientation: "vertical" | "horizontal" = "horizontal";
  public roles: "tablist" | false = "tablist";
  public keyboard: boolean | "changeWithArrows" = true;

  constructor(private ngbConfig: NgbConfig) {}

  public get animation() {
    return this._animation ?? this.ngbConfig.animation;
  }

  public set animation(value: boolean) {
    this._animation = value;
  }

  static get $inject() {
    return [NgbConfig.$name];
  }

  static get $name() {
    return "ngb.nav.config.service";
  }
}
