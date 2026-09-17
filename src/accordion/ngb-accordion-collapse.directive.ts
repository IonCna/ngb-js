import { NgbAccordionItem } from "@ngb/accordion/ngb-accordion-item.directive";
import { NgbCollapse } from "@ngb/collapse/ngb-collapse.directive";
import { Directive, forwardRef, HostBinding, Inject } from "ngjs-core";

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
  item: NgbAccordionItem;
  ngbCollapse: NgbCollapse;

  // `forwardRef` en el primer parámetro: import circular con
  // `ngb-accordion-item.directive.ts` (mismo motivo que su `@ContentChild`).
  constructor(
    @Inject(forwardRef(() => NgbAccordionItem)) item: NgbAccordionItem,
    @Inject(NgbCollapse) ngbCollapse: NgbCollapse,
  ) {
    this.item = item;
    this.ngbCollapse = ngbCollapse;
  }

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
