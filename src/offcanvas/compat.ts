import { NgbOffcanvasModule as NgbOffcanvasModuleClass } from "@ngb/offcanvas/ngb-offcanvas.module";
import { registerNgModule } from "ngjs-core";

/**
 * `ngb-js/offcanvas/compat` — variante **`angular.IModule`** de la feature `offcanvas`,
 * para apps AngularJS 1.x clásicas (sin `ngjs-core`, sin build step).
 *
 * A diferencia de `ngb-js/offcanvas` —donde `NgbOffcanvasModule` es la **clase** `@NgModule`—
 * acá `NgbOffcanvasModule` es el `angular.module(…)` ya registrado. Se agrega a las deps de
 * la app por `.name`:
 *
 * ```js
 * import { NgbOffcanvasModule } from "ngb-js/offcanvas/compat"
 * angular.module("miApp", [NgbOffcanvasModule.name])
 * ```
 *
 * No reescribe el módulo: `registerNgModule` traduce la misma clase `@NgModule`
 * que ya existe (memoizado — comparte instancia con el modo runtime de
 * `ngjs-core`). El resto de la superficie de la feature se reexporta sin cambios.
 */
export const NgbOffcanvasModule = registerNgModule(NgbOffcanvasModuleClass);

export * from "@ngb/offcanvas";
