import { NgbConfig } from "@ngb/ngb-config.service";
import { inject, type Injector, Service } from "ngjs-core";

/**
 * Opciones al abrir un modal con `NgbModal.open()`.
 */
export interface NgbModalOptions {
  animation?: boolean;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  backdrop?: boolean | "static";
  beforeDismiss?: () => boolean | Promise<boolean>;
  centered?: boolean;
  container?: string | HTMLElement;
  fullscreen?: "sm" | "md" | "lg" | "xl" | "xxl" | boolean | string;
  injector?: Injector;
  keyboard?: boolean;
  role?: "alertdialog" | "dialog";
  scrollable?: boolean;
  size?: "sm" | "lg" | "xl" | string;
  windowClass?: string;
  modalDialogClass?: string;
  backdropClass?: string;
  /** ngb-js: bindings que se pasan al componente de contenido (upstream usa `Injector.create`). */
  bindings?: Record<string, unknown>;
}

/**
 * Opciones que se pueden cambiar en un modal abierto con `NgbModalRef.update()` / `NgbActiveModal.update()`.
 *
 * @since 14.2.0
 */
export type NgbModalUpdatableOptions = Pick<
  NgbModalOptions,
  | "ariaLabelledBy"
  | "ariaDescribedBy"
  | "centered"
  | "fullscreen"
  | "backdropClass"
  | "size"
  | "windowClass"
  | "modalDialogClass"
>;

/**
 * Servicio de configuración de [`NgbModal`](#/components/modal/api#NgbModal).
 *
 * @since 3.1.0
 */
@Service()
export class NgbModalConfig implements Required<Omit<NgbModalOptions, "bindings">> {
  private _ngbConfig = inject(NgbConfig);
  private _animation!: boolean;

  ariaLabelledBy!: string;
  ariaDescribedBy!: string;
  backdrop: boolean | "static" = true;
  beforeDismiss!: () => boolean | Promise<boolean>;
  centered!: boolean;
  container!: string | HTMLElement;
  fullscreen: "sm" | "md" | "lg" | "xl" | "xxl" | boolean | string = false;
  injector!: Injector;
  keyboard = true;
  role: "alertdialog" | "dialog" = "dialog";
  scrollable!: boolean;
  size!: "sm" | "lg" | "xl" | string;
  windowClass!: string;
  modalDialogClass!: string;
  backdropClass!: string;

  get animation(): boolean {
    return this._animation ?? this._ngbConfig.animation;
  }
  set animation(animation: boolean) {
    this._animation = animation;
  }
}
