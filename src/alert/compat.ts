import { NgbAlertModule as NgbAlertModuleClass } from "@ngb/alert/ngb-alert.module";
import { registerNgModule } from "ngjs-core";

/**
 * `ngb-js/alert/compat` — variante **`angular.IModule`** de la feature `alert`,
 * para apps AngularJS 1.x clásicas (sin `ngjs-core`, sin build step).
 *
 * A diferencia de `ngb-js/alert` —donde `NgbAlertModule` es la **clase**
 * `@NgModule`— acá `NgbAlertModule` es el `angular.module("ngb.alert", …)` ya
 * registrado. Se agrega a las deps de la app por `.name`:
 *
 * ```js
 * import { NgbAlertModule } from "ngb-js/alert/compat"
 * angular.module("miApp", [NgbAlertModule.name])   // "ngb.alert"
 * ```
 *
 * No reescribe el módulo: `registerNgModule` traduce la misma clase `@NgModule`
 * que ya existe (memoizado — comparte instancia con el modo runtime de
 * `ngjs-core`). El resto de la superficie de la feature se reexporta sin cambios.
 */
export const NgbAlertModule = registerNgModule(NgbAlertModuleClass);

export * from "@ngb/alert";
