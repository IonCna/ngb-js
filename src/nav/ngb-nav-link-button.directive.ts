import { NgbNavLinkBase } from "@ngb/nav/ngb-nav-link-base.directive";
import { Directive, HostBinding, HostListener } from "ngjs-core";

@Directive({
  selector: "button[ngbNavLink]",
})
export class NgbNavLinkButton extends NgbNavLinkBase {
  @HostBinding("attr.type")
  readonly _type = "button";

  @HostBinding("disabled")
  get _disabled(): boolean {
    return this.navItem.disabled;
  }

  @HostListener("click")
  _click(): void {
    this.nav.click(this.navItem);
  }
}
