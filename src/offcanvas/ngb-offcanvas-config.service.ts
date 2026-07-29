import { NgbConfig } from "@ngb/ngb-config.service";
import type { IAugmentedJQuery } from "angular";

export interface NgbOffcanvasOptions {
  animation?: boolean;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  backdrop?: boolean | "static";
  backdropClass?: string;
  beforeDismiss?: () => boolean | Promise<boolean>;
  bindings?: Record<string, unknown>;
  container?: string | IAugmentedJQuery;
  keyboard?: boolean;
  panelClass?: string;
  position?: "start" | "end" | "top" | "bottom";
  scroll?: boolean;
}

export type NgbOffcanvasUpdatableOptions = Pick<
  NgbOffcanvasOptions,
  "animation" | "ariaLabelledBy" | "ariaDescribedBy" | "backdropClass" | "keyboard" | "panelClass" | "position"
>;

export class NgbOffcanvasConfig implements NgbOffcanvasOptions {
  constructor(private _ngbConfig: NgbConfig) {}
  private _animation?: boolean;

  ariaDescribedBy?: string;
  ariaLabelledBy?: string;
  backdrop: boolean | "static" = true;
  backdropClass?: string;
  beforeDismiss?: () => boolean | Promise<boolean>;
  container?: string | IAugmentedJQuery;
  keyboard = true;
  panelClass?: string;
  position: "start" | "end" | "top" | "bottom" = "start";
  scroll = false;

  get animation(): boolean {
    return this._animation ?? this._ngbConfig.animation;
  }

  set animation(animation: boolean) {
    this._animation = animation;
  }

  static get $inject() {
    return [NgbConfig.$name];
  }

  static get $name() {
    return "ngb.offcanvas.config.service";
  }
}
