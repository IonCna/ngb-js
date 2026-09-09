import { NgbToastModule as NgbToastModuleClass } from "@ngb/toast/ngb-toast.module";
import { registerNgModule } from "ngjs-core";

/**
 * `ngb-js/toast/compat` — variante **`angular.IModule`** de la feature `toast`,
 * para apps AngularJS 1.x clásicas (sin `ngjs-core`, sin build step).
 *
 * A diferencia de `ngb-js/toast` —donde `NgbToastModule` es la **clase** `@NgModule`—
 * acá `NgbToastModule` es el `angular.module(…)` ya registrado. Se agrega a las deps de
 * la app por `.name`:
 *
 * ```js
 * import { NgbToastModule } from "ngb-js/toast/compat"
 * angular.module("miApp", [NgbToastModule.name])
 * ```
 *
 * No reescribe el módulo: `registerNgModule` traduce la misma clase `@NgModule`
 * que ya existe (memoizado — comparte instancia con el modo runtime de
 * `ngjs-core`). El resto de la superficie de la feature se reexporta sin cambios.
 */
export const NgbToastModule = registerNgModule(NgbToastModuleClass);

export * from "@ngb/toast";
