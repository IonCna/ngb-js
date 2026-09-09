import { NgbCarouselModule as NgbCarouselModuleClass } from "@ngb/carousel/ngb-carousel.module";
import { registerNgModule } from "ngjs-core";

/**
 * `ngb-js/carousel/compat` — variante **`angular.IModule`** de la feature `carousel`,
 * para apps AngularJS 1.x clásicas (sin `ngjs-core`, sin build step).
 *
 * A diferencia de `ngb-js/carousel` —donde `NgbCarouselModule` es la **clase** `@NgModule`—
 * acá `NgbCarouselModule` es el `angular.module(…)` ya registrado. Se agrega a las deps de
 * la app por `.name`:
 *
 * ```js
 * import { NgbCarouselModule } from "ngb-js/carousel/compat"
 * angular.module("miApp", [NgbCarouselModule.name])
 * ```
 *
 * No reescribe el módulo: `registerNgModule` traduce la misma clase `@NgModule`
 * que ya existe (memoizado — comparte instancia con el modo runtime de
 * `ngjs-core`). El resto de la superficie de la feature se reexporta sin cambios.
 */
export const NgbCarouselModule = registerNgModule(NgbCarouselModuleClass);

export * from "@ngb/carousel";
