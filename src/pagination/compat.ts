import { NgbPaginationModule as NgbPaginationModuleClass } from "@ngb/pagination/ngb-pagination.module";
import { registerNgModule } from "ngjs-core";

/**
 * `ngb-js/pagination/compat` — variante **`angular.IModule`** de la feature `pagination`,
 * para apps AngularJS 1.x clásicas (sin `ngjs-core`, sin build step).
 *
 * A diferencia de `ngb-js/pagination` —donde `NgbPaginationModule` es la **clase** `@NgModule`—
 * acá `NgbPaginationModule` es el `angular.module(…)` ya registrado. Se agrega a las deps de
 * la app por `.name`:
 *
 * ```js
 * import { NgbPaginationModule } from "ngb-js/pagination/compat"
 * angular.module("miApp", [NgbPaginationModule.name])
 * ```
 *
 * No reescribe el módulo: `registerNgModule` traduce la misma clase `@NgModule`
 * que ya existe (memoizado — comparte instancia con el modo runtime de
 * `ngjs-core`). El resto de la superficie de la feature se reexporta sin cambios.
 */
export const NgbPaginationModule = registerNgModule(NgbPaginationModuleClass);

export * from "@ngb/pagination";
