import { NgbNavLinkBase } from "@ngb/nav/ngb-nav-link-base.directive";

/**
 * Compat de import. La lógica de `a[ngbNavLink]` está en `NgbNavLinkBase`
 * (ramifica por `tagName`); esta subclase no se registra. Ver CORE_GAPS.md.
 */
export class NgbNavLink extends NgbNavLinkBase {}
