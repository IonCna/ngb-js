import type { NgbSingleSlideEvent } from "@ngb/carousel/ngb-carousel.component";
import { Directive, EventEmitter, inject, Input, Output, TemplateRef } from "ngjs-core";

let nextId = 0;

/**
 * Directiva que envuelve cada slide individual del carousel.
 */
@Directive({ selector: "ng-template[ngbSlide]" })
export class NgbSlide {
  templateRef = inject(TemplateRef);

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
