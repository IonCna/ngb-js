import { NgbNavModule as NgbNavModuleClass } from "@ngb/nav/ngb-nav.module";
import { registerNgModule } from "ngjs-core";

/**
 * `ngb-js/nav/compat` — variante **`angular.IModule`** de la feature `nav`,
 * para apps AngularJS 1.x clásicas (sin `ngjs-core`, sin build step).
 *
 * A diferencia de `ngb-js/nav` —donde `NgbNavModule` es la **clase** `@NgModule`—
 * acá `NgbNavModule` es el `angular.module(…)` ya registrado. Se agrega a las deps de
 * la app por `.name`:
 *
 * ```js
 * import { NgbNavModule } from "ngb-js/nav/compat"
 * angular.module("miApp", [NgbNavModule.name])
 * ```
 *
 * No reescribe el módulo: `registerNgModule` traduce la misma clase `@NgModule`
 * que ya existe (memoizado — comparte instancia con el modo runtime de
 * `ngjs-core`). El resto de la superficie de la feature se reexporta sin cambios.
 */
export const NgbNavModule = registerNgModule(NgbNavModuleClass);

export * from "@ngb/nav";
