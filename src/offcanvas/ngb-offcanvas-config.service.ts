import { NgbConfig } from "@ngb/config/ngb-config";
import { Injectable, type Injector, inject } from "ngjs-core";

export interface NgbOffcanvasOptions {
  animation?: boolean;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  backdrop?: boolean | "static";
  backdropClass?: string;
  beforeDismiss?: () => boolean | Promise<boolean>;
  /** ngb-js: bindings que se pasan al componente de contenido (upstream usa `Injector.create`). */
  bindings?: Record<string, unknown>;
  container?: string | HTMLElement;
  injector?: Injector;
  keyboard?: boolean;
  panelClass?: string;
  position?: "start" | "end" | "top" | "bottom";
  scroll?: boolean;
}

export type NgbOffcanvasUpdatableOptions = Pick<
  NgbOffcanvasOptions,
  "animation" | "ariaLabelledBy" | "ariaDescribedBy" | "backdropClass" | "keyboard" | "panelClass" | "position"
>;

/**
 * Servicio de configuración de [`NgbOffcanvas`](#/components/offcanvas/api#NgbOffcanvas).
 */
@Injectable({ providedIn: "root" })
export class NgbOffcanvasConfig implements NgbOffcanvasOptions {
  private _ngbConfig = inject(NgbConfig);
  private _animation: boolean;

  ariaDescribedBy?: string;
  ariaLabelledBy?: string;
  backdrop: boolean | "static" = true;
  backdropClass?: string;
  beforeDismiss?: () => boolean | Promise<boolean>;
  container?: string | HTMLElement;
  injector?: Injector;
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
}
