import { NgbConfig } from "@ngb/ngb-config.service";
import type angular from "angular";
import type { IAugmentedJQuery } from "angular";

export interface NgbModalOptions {
  animation?: boolean;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  backdrop?: boolean | "static";
  beforeDismiss?: () => boolean | Promise<boolean>;
  centered?: boolean;
  container?: string | IAugmentedJQuery;
  fullscreen?: "sm" | "md" | "lg" | "xl" | "xxl" | boolean | string;
  injector?: angular.auto.IInjectorService;
  keyboard?: boolean;
  role?: "alertdialog" | "dialog";
  scrollable?: boolean;
  size?: "sm" | "lg" | "xl" | string;
  windowClass?: string;
  modalDialogClass?: string;
  backdropClass?: string;
  bindings?: Record<string, any>;
}

export type NgbModalUpdatableOptions = Pick<
  NgbModalOptions,
  | "animation"
  | "ariaLabelledBy"
  | "ariaDescribedBy"
  | "centered"
  | "fullscreen"
  | "backdropClass"
  | "size"
  | "windowClass"
  | "modalDialogClass"
>;

export class NgbModalConfig implements NgbModalOptions {
  private _animation?: boolean;

  public ariaLabelledBy?: string;
  public ariaDescribedBy?: string;
  public backdrop: boolean | "static" = true;
  public beforeDismiss?: () => boolean | Promise<boolean>;
  public centered?: boolean;
  public container?: string | IAugmentedJQuery;
  public fullscreen: "sm" | "md" | "lg" | "xl" | "xxl" | boolean | string = false;
  public injector?: angular.auto.IInjectorService;
  public keyboard = true;
  public role: "alertdialog" | "dialog" = "dialog";
  public scrollable?: boolean;
  public size?: "sm" | "lg" | "xl" | string;
  public windowClass?: string;
  public modalDialogClass?: string;
  public backdropClass?: string;
  public bindings?: Record<string, any>;

  constructor(private $ngbConfig: NgbConfig) {}

  get animation(): boolean {
    return this._animation ?? this.$ngbConfig.animation;
  }

  set animation(animation: boolean) {
    this._animation = animation;
  }

  static get $inject() {
    return [NgbConfig.$name];
  }

  static get $name() {
    return "ngb.modal.config.service";
  }
}
