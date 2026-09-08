import { NgbNav } from "@ngb/nav/ngb-nav.directive";
import { Attribute, Directive, HostBinding, inject } from "ngjs-core";

@Directive({
  selector: "[ngbNavItem]:not(ng-container)",
})
export class NgbNavItemRole {
  nav = inject(NgbNav);

  constructor(@Attribute("role") public role: string) {}

  @HostBinding("attr.role")
  get _role(): string | undefined {
    return this.role || (this.nav.roles ? "presentation" : undefined);
  }
}
