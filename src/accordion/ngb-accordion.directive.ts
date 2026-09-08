import { NgbAccordionConfig } from "@ngb/accordion/ngb-accordion-config.service";
import { NgbAccordionItem } from "@ngb/accordion/ngb-accordion-item.directive";
import { ContentChildren, Directive, EventEmitter, HostBinding, inject, Input, Output, type QueryList } from "ngjs-core";

/**
 * El acordeón es una pila de tarjetas con header y body colapsable.
 *
 * Esta directiva es el contenedor de esos items y expone una API para manejarlos.
 *
 * @since 14.1.0
 */
@Directive({
  selector: "[ngbAccordion]",
  exportAs: "ngbAccordion",
})
export class NgbAccordionDirective {
  private _config = inject(NgbAccordionConfig);
  private _anItemWasAlreadyExpandedDuringInitialisation = false;

  @ContentChildren(NgbAccordionItem, { descendants: false })
  private _items?: QueryList<NgbAccordionItem>;

  @HostBinding("class.accordion")
  readonly _hostClass = true;

  /** Si es `true`, el acordeón se anima. */
  @Input() animation = this._config.animation;

  /** Si es `true`, solo un item puede quedar abierto a la vez. */
  @Input() closeOthers = this._config.closeOthers;

  /**
   * Si es `true`, el contenido del body de los items se quita del DOM (si no,
   * solo se oculta). Se puede sobreescribir a nivel de `NgbAccordionItem`.
   */
  @Input() destroyOnHide = this._config.destroyOnHide;

  /** Evento emitido antes de la animación de expansión. Payload: id del item mostrado. @since 15.1.0 */
  @Output() show = new EventEmitter<string>();

  /** Evento emitido al terminar la animación de expansión. Payload: id del item mostrado. */
  @Output() shown = new EventEmitter<string>();

  /** Evento emitido antes de la animación de colapso. Payload: id del item ocultado. @since 15.1.0 */
  @Output() hide = new EventEmitter<string>();

  /** Evento emitido al terminar el colapso y antes de sacar el contenido del DOM. Payload: id del item ocultado. */
  @Output() hidden = new EventEmitter<string>();

  /**
   * Alterna el item con el id dado. Lo alterna aunque esté deshabilitado.
   */
  toggle(itemId: string): void {
    this._getItem(itemId)?.toggle();
  }

  /**
   * Expande el item con el id dado. Si `closeOthers` es `true`, colapsa los otros.
   */
  expand(itemId: string): void {
    this._getItem(itemId)?.expand();
  }

  /**
   * Expande todos los items.
   *
   * Si `closeOthers` es `true` y todos están cerrados, abre el primero. Si no,
   * deja el que ya estaba abierto.
   */
  expandAll(): void {
    if (this._items) {
      if (this.closeOthers) {
        if (!this._items.find((item) => !item.collapsed)) {
          this._items.first.expand();
        }
      } else {
        this._items.forEach((item) => item.expand());
      }
    }
  }

  /**
   * Colapsa el item con el id dado. No hace nada si `itemId` no corresponde a
   * ningún item.
   */
  collapse(itemId: string): void {
    this._getItem(itemId)?.collapse();
  }

  /** Colapsa todos los items. */
  collapseAll(): void {
    this._items?.forEach((item) => item.collapse());
  }

  /**
   * Chequea si el item con el id dado está expandido. Devuelve `false` si el
   * `itemId` no corresponde a ningún item.
   */
  isExpanded(itemId: string): boolean {
    const item = this._getItem(itemId);
    return item ? !item.collapsed : false;
  }

  /**
   * Chequea si el item se puede expandir en el estado actual del acordeón.
   * Con `closeOthers` solo puede haber un item expandido a la vez.
   *
   * @internal
   */
  _ensureCanExpand(toExpand: NgbAccordionItem): boolean {
    if (!this.closeOthers) {
      return true;
    }

    // caso especial durante la inicialización de los inputs [collapsed]="false":
    // el QueryList `this._items` todavía no está inicializado, pero necesitamos
    // asegurar que solo un item pueda expandirse a la vez
    if (!this._items) {
      if (!this._anItemWasAlreadyExpandedDuringInitialisation) {
        this._anItemWasAlreadyExpandedDuringInitialisation = true;
        return true;
      }
      return false;
    }

    // si hay un item expandido, hay que colapsarlo primero
    this._items.find((item) => !item.collapsed && toExpand !== item)?.collapse();

    return true;
  }

  private _getItem(itemId: string): NgbAccordionItem | undefined {
    return this._items?.find((item) => item.id === itemId);
  }
}
