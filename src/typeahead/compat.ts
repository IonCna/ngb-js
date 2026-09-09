import { NgbTypeaheadModule as NgbTypeaheadModuleClass } from "@ngb/typeahead/ngb-typeahead.module";
import { registerNgModule } from "ngjs-core";

/**
 * `ngb-js/typeahead/compat` — variante **`angular.IModule`** de la feature `typeahead`,
 * para apps AngularJS 1.x clásicas (sin `ngjs-core`, sin build step).
 *
 * A diferencia de `ngb-js/typeahead` —donde `NgbTypeaheadModule` es la **clase** `@NgModule`—
 * acá `NgbTypeaheadModule` es el `angular.module(…)` ya registrado. Se agrega a las deps de
 * la app por `.name`:
 *
 * ```js
 * import { NgbTypeaheadModule } from "ngb-js/typeahead/compat"
 * angular.module("miApp", [NgbTypeaheadModule.name])
 * ```
 *
 * No reescribe el módulo: `registerNgModule` traduce la misma clase `@NgModule`
 * que ya existe (memoizado — comparte instancia con el modo runtime de
 * `ngjs-core`). El resto de la superficie de la feature se reexporta sin cambios.
 */
export const NgbTypeaheadModule = registerNgModule(NgbTypeaheadModuleClass);

export * from "@ngb/typeahead";
