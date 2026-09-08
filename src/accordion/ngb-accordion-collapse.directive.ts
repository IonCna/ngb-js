import { NgbAccordionItem } from "@ngb/accordion/ngb-accordion-item.directive";
import { NgbCollapse } from "@ngb/collapse/ngb-collapse.directive";
import { Directive, HostBinding, inject } from "ngjs-core";

/**
 * Envuelve el contenido colapsable del item del acordeón.
 *
 * Internamente reutiliza la [directiva `NgbCollapse`](#/components/collapse).
 *
 * @since 14.1.0
 */
@Directive({
  exportAs: "ngbAccordionCollapse",
  selector: "[ngbAccordionCollapse]",
  hostDirectives: [NgbCollapse],
})
export class NgbAccordionCollapse {
  item = inject(NgbAccordionItem);
  ngbCollapse = inject(NgbCollapse);

  @HostBinding("attr.role")
  readonly _role = "region";

  @HostBinding("class.accordion-collapse")
  readonly _hostClass = true;

  @HostBinding("id")
  get _id(): string {
    return this.item.collapseId;
  }

  @HostBinding("attr.aria-labelledby")
  get _ariaLabelledby(): string {
    return this.item.toggleId;
  }
}
