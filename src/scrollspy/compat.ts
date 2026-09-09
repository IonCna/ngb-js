import { NgbScrollSpyModule as NgbScrollSpyModuleClass } from "@ngb/scrollspy/ngb-scrollspy.module";
import { registerNgModule } from "ngjs-core";

/**
 * `ngb-js/scrollspy/compat` — variante **`angular.IModule`** de la feature `scrollspy`,
 * para apps AngularJS 1.x clásicas (sin `ngjs-core`, sin build step).
 *
 * A diferencia de `ngb-js/scrollspy` —donde `NgbScrollSpyModule` es la **clase** `@NgModule`—
 * acá `NgbScrollSpyModule` es el `angular.module(…)` ya registrado. Se agrega a las deps de
 * la app por `.name`:
 *
 * ```js
 * import { NgbScrollSpyModule } from "ngb-js/scrollspy/compat"
 * angular.module("miApp", [NgbScrollSpyModule.name])
 * ```
 *
 * No reescribe el módulo: `registerNgModule` traduce la misma clase `@NgModule`
 * que ya existe (memoizado — comparte instancia con el modo runtime de
 * `ngjs-core`). El resto de la superficie de la feature se reexporta sin cambios.
 */
export const NgbScrollSpyModule = registerNgModule(NgbScrollSpyModuleClass);

export * from "@ngb/scrollspy";
