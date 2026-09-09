import { NgbOffcanvasConfig, type NgbOffcanvasOptions } from "@ngb/offcanvas/ngb-offcanvas-config.service";
import type { NgbOffcanvasRef } from "@ngb/offcanvas/ngb-offcanvas-ref";
import { NgbOffcanvasStack } from "@ngb/offcanvas/ngb-offcanvas-stack.service";
import { Injector, inject, Service } from "ngjs-core";

/**
 * Servicio para abrir offcanvas.
 *
 * Crear un offcanvas: armá un componente o un `TemplateRef` y pasalo a `.open()`.
 */
@Service({ id: "ngb.offcanvas.service" })
export class NgbOffcanvas {
  private _injector = inject(Injector);
  private _offcanvasStack = inject(NgbOffcanvasStack);
  private _config = inject(NgbOffcanvasConfig);

  /**
   * Abre un offcanvas con el contenido y las opciones dadas.
   *
   * ADAPTACIÓN: `createComponent` de `ngjs-core` es async, así que `open()`
   * devuelve una `Promise<NgbOffcanvasRef>` (upstream es sync). Ver CORE_GAPS.
   */
  open<T = unknown>(content: unknown, options: NgbOffcanvasOptions = {}): Promise<NgbOffcanvasRef<T>> {
    const combinedOptions = { ...this._config, animation: this._config.animation, ...options };
    return this._offcanvasStack.open<T>(this._injector, content, combinedOptions);
  }

  /** Observable con la instancia de offcanvas activa. */
  get activeInstance() {
    return this._offcanvasStack.activeInstance;
  }

  /** Descarta el offcanvas abierto con la razón dada. */
  dismiss(reason?: unknown) {
    this._offcanvasStack.dismiss(reason);
  }

  /** `true` si hay un offcanvas abierto en la app. */
  hasOpenOffcanvas(): boolean {
    return this._offcanvasStack.hasOpenOffcanvas();
  }
}
