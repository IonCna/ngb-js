/**
 * Tokens `$inject` de la feature `modal` — el string bajo el que `NgbModal` /
 * `NgbModalConfig` quedan registrados en el `$injector` de AngularJS
 * (`ngb-modal.module.ts` los provee con `useFactory`). Distintos del `$name`
 * interno del `@Service`.
 *
 * `NgbModalStack` es interno en ng-bootstrap (no está en el barrel) → sin token.
 *
 * ```js
 * import { NgbModalModule, NGB_MODAL } from "ngb-js/modal/compat";
 * angular.module("app", [NgbModalModule.name])
 *   .controller("X", [NGB_MODAL, function (modal) { modal.open(...); }]);
 * ```
 */
export const NGB_MODAL = "ngb.modal";
export const NGB_MODAL_CONFIG = "ngb.modal.config";
