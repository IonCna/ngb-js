import type { PlacementArray } from "@ngb/utils/positioning";
import type { Options } from "@popperjs/core";
import { Injectable } from "ngjs-core";

export interface INgbDropdownAnchor {
  nativeElement: HTMLElement;
}

/**
 * Servicio de configuración de [`NgbDropdown`](#/components/dropdown/api#NgbDropdown).
 * Inyectalo (normalmente en el componente raíz) y ajustá sus propiedades para
 * fijar valores por defecto de todos los dropdowns de la app.
 */
@Injectable({ providedIn: "root" })
export class NgbDropdownConfig {
  autoClose: boolean | "inside" | "outside" = true;
  placement: PlacementArray = ["bottom-start", "bottom-end", "top-start", "top-end"];
  popperOptions = (options: Partial<Options>) => options;
  container: null | "body" = null;
}
