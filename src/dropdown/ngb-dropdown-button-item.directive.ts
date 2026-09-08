import { NgbDropdownItem } from "@ngb/dropdown/ngb-dropdown-item.directive";

/**
 * En ng-bootstrap `NgbDropdownButtonItem` es una directiva aparte
 * (`selector: "button[ngbDropdownItem]"`) que solo refleja `disabled`. Acá esa
 * lógica está integrada en `NgbDropdownItem` (ramifica por `tagName`), porque
 * AngularJS no admite dos directivas con el mismo nombre y ambas con controller.
 * Se mantiene el símbolo como alias fino para compatibilidad de import; NO se
 * registra en el módulo.
 */
export class NgbDropdownButtonItem extends NgbDropdownItem {}
