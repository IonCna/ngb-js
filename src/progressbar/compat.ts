import { NgbProgressbarModule as NgbProgressbarModuleClass } from "@ngb/progressbar/ngb-progressbar.module";
import { registerNgModule } from "ngjs-core";

/**
 * `ngb-js/progressbar/compat` — variante **`angular.IModule`** de la feature `progressbar`,
 * para apps AngularJS 1.x clásicas (sin `ngjs-core`, sin build step).
 *
 * A diferencia de `ngb-js/progressbar` —donde `NgbProgressbarModule` es la **clase** `@NgModule`—
 * acá `NgbProgressbarModule` es el `angular.module(…)` ya registrado. Se agrega a las deps de
 * la app por `.name`:
 *
 * ```js
 * import { NgbProgressbarModule } from "ngb-js/progressbar/compat"
 * angular.module("miApp", [NgbProgressbarModule.name])
 * ```
 *
 * No reescribe el módulo: `registerNgModule` traduce la misma clase `@NgModule`
 * que ya existe (memoizado — comparte instancia con el modo runtime de
 * `ngjs-core`). El resto de la superficie de la feature se reexporta sin cambios.
 */
export const NgbProgressbarModule = registerNgModule(NgbProgressbarModuleClass);

export * from "@ngb/progressbar";
