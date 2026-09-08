import { NgbAccordionItem } from "@ngb/accordion/ngb-accordion-item.directive";
import { NgbAccordionDirective } from "@ngb/accordion/ngb-accordion.directive";
import { Directive, HostBinding, HostListener, inject } from "ngjs-core";

/**
 * Directiva para poner en un elemento toggle dentro del header del item del
 * acordeón: registra el handler de click que alterna el panel y maneja los
 * atributos de accesibilidad.
 *
 * La usa internamente la [directiva `NgbAccordionButton`](#/components/accordion/api#NgbAccordionButton).
 *
 * @since 14.1.0
 */
@Directive({
  selector: "[ngbAccordionToggle]",
})
export class NgbAccordionToggle {
  item = inject(NgbAccordionItem);
  accordion = inject(NgbAccordionDirective);

  @HostBinding("id")
  get _id(): string {
    return this.item.toggleId;
  }

  @HostBinding("class.collapsed")
  get _collapsed(): boolean {
    return this.item.collapsed;
  }

  @HostBinding("attr.aria-controls")
  get _ariaControls(): string {
    return this.item.collapseId;
  }

  @HostBinding("attr.aria-expanded")
  get _ariaExpanded(): string {
    return `${!this.item.collapsed}`;
  }

  @HostListener("click")
  _onClick(): void {
    if (!this.item.disabled) {
      this.accordion.toggle(this.item.id);
    }
  }
}
