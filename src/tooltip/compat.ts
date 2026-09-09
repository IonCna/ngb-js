import { NgbTooltipModule as NgbTooltipModuleClass } from "@ngb/tooltip/ngb-tooltip.module";
import { registerNgModule } from "ngjs-core";

/**
 * `ngb-js/tooltip/compat` — variante **`angular.IModule`** de la feature `tooltip`,
 * para apps AngularJS 1.x clásicas (sin `ngjs-core`, sin build step).
 *
 * A diferencia de `ngb-js/tooltip` —donde `NgbTooltipModule` es la **clase** `@NgModule`—
 * acá `NgbTooltipModule` es el `angular.module(…)` ya registrado. Se agrega a las deps de
 * la app por `.name`:
 *
 * ```js
 * import { NgbTooltipModule } from "ngb-js/tooltip/compat"
 * angular.module("miApp", [NgbTooltipModule.name])
 * ```
 *
 * No reescribe el módulo: `registerNgModule` traduce la misma clase `@NgModule`
 * que ya existe (memoizado — comparte instancia con el modo runtime de
 * `ngjs-core`). El resto de la superficie de la feature se reexporta sin cambios.
 */
export const NgbTooltipModule = registerNgModule(NgbTooltipModuleClass);

export * from "@ngb/tooltip";
