import { NgbDropdownItem } from "@ngb/dropdown/ngb-dropdown-item.directive";
import { Directive, HostBinding, inject } from "ngjs-core";

/**
 * En ng-bootstrap `NgbDropdownButtonItem` es una directiva aparte
 * (`selector: "button[ngbDropdownItem]"`) que solo refleja `disabled`. Acá esa
 * lógica está integrada en `NgbDropdownItem` (ramifica por `tagName`), porque
 * AngularJS no admite dos directivas con el mismo nombre y ambas con controller.
 * Se mantiene el símbolo como alias fino para compatibilidad de import; NO se
 * registra en el módulo.
 */
@Directive({ selector: "button[ngbDropdownItem]" })
export class NgbDropdownButtonItem {
  private _item = inject(NgbDropdownItem);

  @HostBinding("disabled")
  get _disabled(): boolean {
    return this._item.disabled;
  }
}
