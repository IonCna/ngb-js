import type { NgbModalOptions } from "@ngb/modal/ngb-modal-config.service";
import { NgbModalConfig } from "@ngb/modal/ngb-modal-config.service";
import type { NgbModalRef } from "@ngb/modal/ngb-modal-ref";
import { NgbModalStack } from "@ngb/modal/ngb-modal-stack.service";
import { inject, Injector, Service } from "ngjs-core";

/**
 * Servicio para abrir modales.
 *
 * Crear un modal: armá un componente o un `TemplateRef` y pasalo a `.open()`.
 */
@Service()
export class NgbModal {
  private _injector = inject(Injector);
  private _modalStack = inject(NgbModalStack);
  private _config = inject(NgbModalConfig);

  /**
   * Abre un modal con el contenido y las opciones dadas.
   *
   * El contenido puede ser un `TemplateRef` o un tipo de componente. Si pasás un
   * componente, sus instancias pueden inyectar `NgbActiveModal` para
   * cerrar/descartar el modal desde adentro.
   *
   * ADAPTACIÓN: `createComponent` de `ngjs-core` es async, así que `open()`
   * devuelve una `Promise<NgbModalRef>` (upstream es sync). Ver CORE_GAPS.
   */
  open<T = unknown>(content: unknown, options: NgbModalOptions = {}): Promise<NgbModalRef<T>> {
    const combinedOptions = { ...this._config, animation: this._config.animation, ...options };
    return this._modalStack.open<T>(this._injector, content, combinedOptions);
  }

  /** Observable con las instancias de modales activas. */
  get activeInstances() {
    return this._modalStack.activeInstances;
  }

  /**
   * Descarta todos los modales abiertos con la razón dada.
   *
   * @since 3.1.0
   */
  dismissAll(reason?: unknown) {
    this._modalStack.dismissAll(reason);
  }

  /**
   * `true` si hay algún modal abierto en la app.
   *
   * @since 3.3.0
   */
  hasOpenModals(): boolean {
    return this._modalStack.hasOpenModals();
  }
}
