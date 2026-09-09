import { NgbCollapseModule as NgbCollapseModuleClass } from "@ngb/collapse/ngb-collapse.module";
import { registerNgModule } from "ngjs-core";

/**
 * `ngb-js/collapse/compat` — variante **`angular.IModule`** de la feature `collapse`,
 * para apps AngularJS 1.x clásicas (sin `ngjs-core`, sin build step).
 *
 * A diferencia de `ngb-js/collapse` —donde `NgbCollapseModule` es la **clase** `@NgModule`—
 * acá `NgbCollapseModule` es el `angular.module(…)` ya registrado. Se agrega a las deps de
 * la app por `.name`:
 *
 * ```js
 * import { NgbCollapseModule } from "ngb-js/collapse/compat"
 * angular.module("miApp", [NgbCollapseModule.name])
 * ```
 *
 * No reescribe el módulo: `registerNgModule` traduce la misma clase `@NgModule`
 * que ya existe (memoizado — comparte instancia con el modo runtime de
 * `ngjs-core`). El resto de la superficie de la feature se reexporta sin cambios.
 */
export const NgbCollapseModule = registerNgModule(NgbCollapseModuleClass);

export * from "@ngb/collapse";
