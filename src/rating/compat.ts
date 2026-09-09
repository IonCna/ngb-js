import { NgbRatingModule as NgbRatingModuleClass } from "@ngb/rating/ngb-rating.module";
import { registerNgModule } from "ngjs-core";

/**
 * `ngb-js/rating/compat` — variante **`angular.IModule`** de la feature `rating`,
 * para apps AngularJS 1.x clásicas (sin `ngjs-core`, sin build step).
 *
 * A diferencia de `ngb-js/rating` —donde `NgbRatingModule` es la **clase** `@NgModule`—
 * acá `NgbRatingModule` es el `angular.module(…)` ya registrado. Se agrega a las deps de
 * la app por `.name`:
 *
 * ```js
 * import { NgbRatingModule } from "ngb-js/rating/compat"
 * angular.module("miApp", [NgbRatingModule.name])
 * ```
 *
 * No reescribe el módulo: `registerNgModule` traduce la misma clase `@NgModule`
 * que ya existe (memoizado — comparte instancia con el modo runtime de
 * `ngjs-core`). El resto de la superficie de la feature se reexporta sin cambios.
 */
export const NgbRatingModule = registerNgModule(NgbRatingModuleClass);

export * from "@ngb/rating";
