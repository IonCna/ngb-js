import { NgbTimepickerModule as NgbTimepickerModuleClass } from "@ngb/timepicker/ngb-timepicker.module";
import { registerNgModule } from "ngjs-core";

/**
 * `ngb-js/timepicker/compat` — variante **`angular.IModule`** de la feature `timepicker`,
 * para apps AngularJS 1.x clásicas (sin `ngjs-core`, sin build step).
 *
 * A diferencia de `ngb-js/timepicker` —donde `NgbTimepickerModule` es la **clase** `@NgModule`—
 * acá `NgbTimepickerModule` es el `angular.module(…)` ya registrado. Se agrega a las deps de
 * la app por `.name`:
 *
 * ```js
 * import { NgbTimepickerModule } from "ngb-js/timepicker/compat"
 * angular.module("miApp", [NgbTimepickerModule.name])
 * ```
 *
 * No reescribe el módulo: `registerNgModule` traduce la misma clase `@NgModule`
 * que ya existe (memoizado — comparte instancia con el modo runtime de
 * `ngjs-core`). El resto de la superficie de la feature se reexporta sin cambios.
 */
export const NgbTimepickerModule = registerNgModule(NgbTimepickerModuleClass);

export * from "@ngb/timepicker";
