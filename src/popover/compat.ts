import { NgbPopoverModule as NgbPopoverModuleClass } from "@ngb/popover/ngb-popover.module";
import { registerNgModule } from "ngjs-core";

/**
 * `ngb-js/popover/compat` — variante **`angular.IModule`** de la feature `popover`,
 * para apps AngularJS 1.x clásicas (sin `ngjs-core`, sin build step).
 *
 * A diferencia de `ngb-js/popover` —donde `NgbPopoverModule` es la **clase** `@NgModule`—
 * acá `NgbPopoverModule` es el `angular.module(…)` ya registrado. Se agrega a las deps de
 * la app por `.name`:
 *
 * ```js
 * import { NgbPopoverModule } from "ngb-js/popover/compat"
 * angular.module("miApp", [NgbPopoverModule.name])
 * ```
 *
 * No reescribe el módulo: `registerNgModule` traduce la misma clase `@NgModule`
 * que ya existe (memoizado — comparte instancia con el modo runtime de
 * `ngjs-core`). El resto de la superficie de la feature se reexporta sin cambios.
 */
export const NgbPopoverModule = registerNgModule(NgbPopoverModuleClass);

export * from "@ngb/popover";
