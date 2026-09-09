import { NgbModalModule as NgbModalModuleClass } from "@ngb/modal/ngb-modal.module";
import { registerNgModule } from "ngjs-core";

/**
 * `ngb-js/modal/compat` — variante **`angular.IModule`** de la feature `modal`,
 * para apps AngularJS 1.x clásicas (sin `ngjs-core`, sin build step).
 *
 * A diferencia de `ngb-js/modal` —donde `NgbModalModule` es la **clase** `@NgModule`—
 * acá `NgbModalModule` es el `angular.module(…)` ya registrado. Se agrega a las deps de
 * la app por `.name`:
 *
 * ```js
 * import { NgbModalModule, NGB_MODAL } from "ngb-js/modal/compat"
 * angular.module("miApp", [NgbModalModule.name])
 *   .controller("Foo", [NGB_MODAL, function (NgbModal) { NgbModal.open(...) }])
 * ```
 *
 * `registerNgModule` traduce la misma clase `@NgModule` que ya existe (memoizado —
 * comparte instancia con el modo runtime de `ngjs-core`), incluidos los tokens
 * `NGB_MODAL*` de su `providers` (ver `ngb-modal.module.ts` / `tokens.ts`). El
 * resto de la superficie de la feature se reexporta sin cambios.
 */
export const NgbModalModule = registerNgModule(NgbModalModuleClass);

export * from "@ngb/modal";
