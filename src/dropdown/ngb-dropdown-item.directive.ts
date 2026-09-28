import { Directive, ElementRef, HostBinding, Input, inject, NgDisabled } from "ngjs-core";

/**
 * Poné esta directiva en un ítem del dropdown para habilitar navegación por
 * teclado: las flechas mueven el foco entre los ítems marcados con ella.
 *
 * El estado `disabled` se toma solo de `ng-disabled="expr"` (no de un
 * `@Input() disabled` como upstream): `disabled` es un atributo booleano nativo
 * y el navegador + AngularJS se pelean por él. Ver `CORE_GAPS.md`.
 *
 * ng-bootstrap separa el caso `<button>` en `NgbDropdownButtonItem`
 * (`selector: "button[ngbDropdownItem]"`). AngularJS no deja dos directivas con
 * el mismo nombre y ambas con controller (`$compile:multidir`), así que acá va
 * integrado y ramifica por `tagName`. Ver `CORE_GAPS.md`.
 */
@Directive({ selector: "[ngbDropdownItem]" })
export class NgbDropdownItem {
  private _ngDisabled = inject(NgDisabled, { optional: true });

  @Input() tabindex: string | number = 0;

  nativeElement = inject(ElementRef<HTMLElement>).nativeElement;

  @HostBinding("class.dropdown-item")
  readonly _dropdownItemClass = true;

  get disabled(): boolean {
    return !!this._ngDisabled?.disabled;
  }

  @HostBinding("class.disabled")
  get _disabled(): boolean {
    return this.disabled;
  }

  @HostBinding("tabIndex")
  get _tabIndex(): number | string {
    return this.disabled ? -1 : this.tabindex;
  }

  /** Solo para `<button ngbDropdownItem>` — el resto de los tags no llevan `disabled` nativo. */
  @HostBinding("disabled")
  get _nativeDisabled(): boolean | undefined {
    return this.nativeElement.tagName === "BUTTON" ? this.disabled : undefined;
  }
}
