import { NgbConfig } from "@ngb/ngb-config.service";
import { inject, Service } from "ngjs-core";

/**
 * Servicio de configuración de [`NgbCarousel`](#/components/carousel/api#NgbCarousel).
 * Inyectalo (normalmente en el componente raíz) y ajustá sus propiedades para
 * fijar valores por defecto de todos los carousels de la app.
 */
@Service({ id: "ngb.carousel.config.service" })
export class NgbCarouselConfig {
  private _ngbConfig = inject(NgbConfig);
  private _animation?: boolean;

  interval = 5000;
  wrap = true;
  keyboard = true;
  pauseOnHover = true;
  pauseOnFocus = true;
  showNavigationArrows = true;
  showNavigationIndicators = true;

  get animation(): boolean {
    return this._animation ?? this._ngbConfig.animation;
  }
  set animation(animation: boolean) {
    this._animation = animation;
  }
}
