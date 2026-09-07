import { NgbNavLinkBase } from "@ngb/nav/ngb-nav-link-base.directive";
import { Directive, HostBinding, HostListener } from "ngjs-core";

@Directive({
  selector: "a[ngbNavLink]",
})
export class NgbNavLink extends NgbNavLinkBase {
  @HostBinding("attr.href")
  readonly _href = "";

  @HostListener("click", ["$event"])
  _click(event: MouseEvent): void {
    this.nav.click(this.navItem);
    event.preventDefault();
  }
}
