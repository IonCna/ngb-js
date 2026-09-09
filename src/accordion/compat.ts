import { NgbAccordionModule as NgbAccordionModuleClass } from "@ngb/accordion/ngb-accordion.module";
import { registerNgModule } from "ngjs-core";

/**
 * `ngb-js/accordion/compat` — variante **`angular.IModule`** de la feature `accordion`,
 * para apps AngularJS 1.x clásicas (sin `ngjs-core`, sin build step).
 *
 * A diferencia de `ngb-js/accordion` —donde `NgbAccordionModule` es la **clase** `@NgModule`—
 * acá `NgbAccordionModule` es el `angular.module(…)` ya registrado. Se agrega a las deps de
 * la app por `.name`:
 *
 * ```js
 * import { NgbAccordionModule } from "ngb-js/accordion/compat"
 * angular.module("miApp", [NgbAccordionModule.name])
 * ```
 *
 * No reescribe el módulo: `registerNgModule` traduce la misma clase `@NgModule`
 * que ya existe (memoizado — comparte instancia con el modo runtime de
 * `ngjs-core`). El resto de la superficie de la feature se reexporta sin cambios.
 */
export const NgbAccordionModule = registerNgModule(NgbAccordionModuleClass);

export * from "@ngb/accordion";
