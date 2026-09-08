import { NgbNavLinkBase } from "@ngb/nav/ngb-nav-link-base.directive";

/**
 * Compat de import. La lógica de `button[ngbNavLink]` está en `NgbNavLinkBase`
 * (ramifica por `tagName`); esta subclase no se registra. Ver CORE_GAPS.md.
 */
export class NgbNavLinkButton extends NgbNavLinkBase {}
