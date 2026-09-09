import { NgbDatepickerModule as NgbDatepickerModuleClass } from "@ngb/datepicker/ngb-datepicker.module";
import { registerNgModule } from "ngjs-core";

/**
 * `ngb-js/datepicker/compat` — variante **`angular.IModule`** de la feature `datepicker`,
 * para apps AngularJS 1.x clásicas (sin `ngjs-core`, sin build step).
 *
 * A diferencia de `ngb-js/datepicker` —donde `NgbDatepickerModule` es la **clase** `@NgModule`—
 * acá `NgbDatepickerModule` es el `angular.module(…)` ya registrado. Se agrega a las deps de
 * la app por `.name`:
 *
 * ```js
 * import { NgbDatepickerModule } from "ngb-js/datepicker/compat"
 * angular.module("miApp", [NgbDatepickerModule.name])
 * ```
 *
 * No reescribe el módulo: `registerNgModule` traduce la misma clase `@NgModule`
 * que ya existe (memoizado — comparte instancia con el modo runtime de
 * `ngjs-core`). El resto de la superficie de la feature se reexporta sin cambios.
 */
export const NgbDatepickerModule = registerNgModule(NgbDatepickerModuleClass);

export * from "@ngb/datepicker";
