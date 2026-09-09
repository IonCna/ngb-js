/**
 * Tokens `$inject` de la feature `offcanvas` — el string bajo el que `NgbOffcanvas`
 * / `NgbOffcanvasConfig` quedan registrados en el `$injector` de AngularJS
 * (`ngb-offcanvas.module.ts` los provee con `useFactory`). Distintos del `$name`
 * interno del `@Service`.
 *
 * `NgbOffcanvasStack` es interno en ng-bootstrap (no está en el barrel) → sin token.
 */
export const NGB_OFFCANVAS = "ngb.offcanvas";
export const NGB_OFFCANVAS_CONFIG = "ngb.offcanvas.config";
