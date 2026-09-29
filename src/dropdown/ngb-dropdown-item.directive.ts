import { Directive, ElementRef, HostBinding, Input, inject } from "ngjs-core";

/**
 * Poné esta directiva en un ítem del dropdown para habilitar navegación por
 * teclado: las flechas mueven el foco entre los ítems marcados con ella.
 *
 * ng-bootstrap separa el caso `<button>` en `NgbDropdownButtonItem`
 * (`selector: "button[ngbDropdownItem]"`). AngularJS no deja dos directivas con
 * el mismo nombre y ambas con controller (`$compile:multidir`), así que acá va
 * integrado y ramifica por `tagName`.
 */
@Directive({ selector: "[ngbDropdownItem]" })
export class NgbDropdownItem {
  static ngAcceptInputType_disabled: boolean | "";

  private _disabled = false;

  @Input() tabindex: string | number = 0;

  nativeElement = inject(ElementRef<HTMLElement>).nativeElement;

  @HostBinding("class.dropdown-item")
  readonly _dropdownItemClass = true;

  @Input()
  set disabled(value: boolean) {
    this._disabled = <any>value === "" || value === true; // accept an empty attribute as true
  }

  get disabled(): boolean {
    return this._disabled;
  }

  @HostBinding("class.disabled")
  get _disabledClass(): boolean {
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
