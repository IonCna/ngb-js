import type { NgbSingleSlideEvent } from "@ngb/carousel/ngb-carousel.component";
import { Directive, EventEmitter, Input, Output, type TemplateRef } from "ngjs-core";

let nextId = 0;

/**
 * Directiva que envuelve cada slide individual del carousel.
 *
 * WORKAROUND (Gap B, ver CORE_GAPS "ngTemplate / inject(TemplateRef)"):
 * upstream hace `templateRef = inject(TemplateRef)` acá. En `ngjs-core`
 * `inject(TemplateRef)` desde una `@Directive` sobre `<ng-template>` no
 * resuelve (el `ngTemplate` es `transclude:'element'`, su controller queda en
 * el nodo-comentario). Se usa el patrón de `NgbNav`: `NgbCarousel` lee el
 * `TemplateRef` con `@ContentChildren(NgbSlide, { read: TemplateRef })` y lo
 * asigna acá (`_bindSlideTemplates`).
 */
@Directive({ selector: "ng-template[ngbSlide]" })
export class NgbSlide {
  /** Lo asigna `NgbCarousel` (ver arriba). */
  templateRef?: TemplateRef<unknown>;

  /**
   * Id del slide, único en todo el documento.
   *
   * Si no se da, se genera con el formato `ngb-slide-xx`.
   *
   * `binding: "@"` es la traducción de `ngjs-core` para un `@Input()` que recibe
   * un string literal (`id="slide-1"`) — ver CORE_GAPS (`@Input` literal, RESUELTO).
   */
  @Input({ binding: "@" }) id = `ngb-slide-${nextId++}`;

  /**
   * Evento emitido cuando termina la transición del slide.
   *
   * @since 8.0.0
   */
  @Output() slid = new EventEmitter<NgbSingleSlideEvent>();
}
