/**
 * `ngb-js` (root) — solo lo **global**. Cada feature se importa por su propio
 * subpath en **clases sueltas** (`ngb-js/alert`, `ngb-js/modal`, …); la variante
 * `angular.IModule` para AngularJS 1.x clásico vive en `…/compat`
 * (`ngb-js/compat`, `ngb-js/alert/compat`, …).
 */
export { NgbModule } from "@ngb/ngb.module";
export { NgbConfig } from "@ngb/ngb-config.service";
