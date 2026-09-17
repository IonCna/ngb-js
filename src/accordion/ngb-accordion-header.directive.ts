import { NgbAccordionItem } from "@ngb/accordion/ngb-accordion-item.directive";
import { Directive, HostBinding, Inject } from "ngjs-core";

/**
 * Directiva que envuelve el header de un item del acordeón.
 *
 * @since 14.1.0
 */
@Directive({
  selector: "[ngbAccordionHeader]",
})
export class NgbAccordionHeader {
  item: NgbAccordionItem;

  constructor(@Inject(NgbAccordionItem) item: NgbAccordionItem) {
    this.item = item;
  }

  @HostBinding("attr.role")
  readonly _role = "heading";

  @HostBinding("class.accordion-header")
  readonly _hostClass = true;

  @HostBinding("class.collapsed")
  get _collapsed(): boolean {
    return this.item.collapsed;
  }
}
