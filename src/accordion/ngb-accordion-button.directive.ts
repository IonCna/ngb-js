import { NgbAccordionItem } from "@ngb/accordion/ngb-accordion-item.directive";
import { NgbAccordionToggle } from "@ngb/accordion/ngb-accordion-toggle.directive";
import { Directive, HostBinding, inject } from "ngjs-core";

/**
 * Directiva para poner en un `<button>` dentro del header de un item del acordeón.
 *
 * Si querés markup custom para el header, usá la
 * [directiva `NgbAccordionToggle`](#/components/accordion/api#NgbAccordionToggle).
 *
 * @since 14.1.0
 */
@Directive({
  selector: "button[ngbAccordionButton]",
  hostDirectives: [NgbAccordionToggle],
})
export class NgbAccordionButton {
  item = inject(NgbAccordionItem);

  @HostBinding("disabled")
  get _disabled(): boolean {
    return this.item.disabled;
  }

  @HostBinding("class.accordion-button")
  readonly _hostClass = true;

  @HostBinding("attr.type")
  readonly _type = "button";
}
