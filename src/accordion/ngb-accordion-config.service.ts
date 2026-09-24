import { NgbConfig } from "@ngb/config/ngb-config";
import { Injectable, inject } from "ngjs-core";

/**
 * Servicio de configuración de
 * [`NgbAccordionDirective`](#/components/accordion/api#NgbAccordionDirective).
 * Inyectalo (normalmente en el componente raíz) y ajustá sus propiedades para
 * fijar valores por defecto de todos los acordeones de la app.
 */
@Injectable({ providedIn: "root" })
export class NgbAccordionConfig {
  private _ngbConfig = inject(NgbConfig);
  private _animation?: boolean;

  closeOthers = false;
  destroyOnHide = true;

  get animation(): boolean {
    return this._animation ?? this._ngbConfig.animation;
  }
  set animation(animation: boolean) {
    this._animation = animation;
  }
}
