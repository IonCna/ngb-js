import { Directive, ElementRef, HostBinding, inject, Input, NgDisabled } from "ngjs-core";

/**
 * Poné esta directiva en un ítem del dropdown para habilitar navegación por
 * teclado: las flechas mueven el foco entre los ítems marcados con ella.
 *
 * El estado `disabled` se toma de `ngDisabled` (no de un `@Input() disabled`):
 * `disabled` es un atributo booleano nativo y el navegador + AngularJS se pelean
 * por él, así que `ng-disabled="expr"` es la vía compatible con la API vanilla
 * sin ese choque. Ver `CORE_GAPS.md`.
 *
 * ng-bootstrap separa el caso `<button>` en `NgbDropdownButtonItem`
 * (`selector: "button[ngbDropdownItem]"`). AngularJS no deja dos directivas con
 * el mismo nombre y ambas con controller (`$compile:multidir`), así que acá va
 * integrado y ramifica por `tagName`. Ver `CORE_GAPS.md`.
 */
@Directive({ selector: "[ngbDropdownItem]" })
export class NgbDropdownItem {
  nativeElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  private _ngDisabled = inject(NgDisabled, { optional: true });

  @Input() tabindex: string | number = 0;

  @HostBinding("class.dropdown-item")
  readonly _dropdownItemClass = true;

  isDisabled(): boolean {
    return this._ngDisabled?.disabled ?? false;
  }

  onDisabledChange(callback: (disabled: boolean) => void): () => void {
    return this._ngDisabled?.onChange(callback) ?? (() => undefined);
  }

  @HostBinding("class.disabled")
  get _disabled(): boolean {
    return this.isDisabled();
  }

  @HostBinding("tabIndex")
  get _tabIndex(): number | string {
    return this.isDisabled() ? -1 : this.tabindex;
  }

  /** Solo para `<button ngbDropdownItem>` — el resto de los tags no llevan `disabled` nativo. */
  @HostBinding("disabled")
  get _nativeDisabled(): boolean | undefined {
    return this.nativeElement.tagName === "BUTTON" ? this.isDisabled() : undefined;
  }
}
