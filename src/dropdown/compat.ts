import { NgbDropdownModule as NgbDropdownModuleClass } from "@ngb/dropdown/ngb-dropdown.module";
import { registerNgModule } from "ngjs-core";

/**
 * `ngb-js/dropdown/compat` — variante **`angular.IModule`** de la feature `dropdown`,
 * para apps AngularJS 1.x clásicas (sin `ngjs-core`, sin build step).
 *
 * A diferencia de `ngb-js/dropdown` —donde `NgbDropdownModule` es la **clase** `@NgModule`—
 * acá `NgbDropdownModule` es el `angular.module(…)` ya registrado. Se agrega a las deps de
 * la app por `.name`:
 *
 * ```js
 * import { NgbDropdownModule } from "ngb-js/dropdown/compat"
 * angular.module("miApp", [NgbDropdownModule.name])
 * ```
 *
 * No reescribe el módulo: `registerNgModule` traduce la misma clase `@NgModule`
 * que ya existe (memoizado — comparte instancia con el modo runtime de
 * `ngjs-core`). El resto de la superficie de la feature se reexporta sin cambios.
 */
export const NgbDropdownModule = registerNgModule(NgbDropdownModuleClass);

export * from "@ngb/dropdown";
