import { NgbNav } from "@ngb/nav/ngb-nav.directive";
import { NgbNavItem } from "@ngb/nav/ngb-nav-item.directive";
import { Attribute, Directive, ElementRef, HostBinding, inject } from "ngjs-core";

@Directive({
  selector: "[ngbNavLink]",
})
export class NgbNavLinkBase {
  navItem = inject(NgbNavItem);
  nav = inject(NgbNav);
  nativeElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  constructor(@Attribute("role") public role: string) {}

  @HostBinding("attr.id")
  get _id(): string {
    return this.navItem.domId;
  }

  @HostBinding("class.nav-link")
  readonly _navLinkClass = true;

  @HostBinding("class.nav-item")
  get _navItemClass(): boolean {
    return this.navItem.isNgContainer();
  }

  @HostBinding("attr.role")
  get _role(): string | undefined {
    return this.role || (this.nav.roles ? "tab" : undefined);
  }

  @HostBinding("class.active")
  get _active(): boolean {
    return this.navItem.active;
  }

  @HostBinding("class.disabled")
  get _disabledClass(): boolean {
    return this.navItem.disabled;
  }

  @HostBinding("attr.tabindex")
  get tabindex(): number | undefined {
    if (this.nav.keyboard === false) {
      return this.navItem.disabled ? -1 : undefined;
    }
    if (this.nav._navigatingWithKeyboard) {
      return -1;
    }
    return this.navItem.disabled || !this.navItem.active ? -1 : undefined;
  }

  @HostBinding("attr.aria-controls")
  get _ariaControls(): string | null {
    return this.navItem.isPanelInDom() ? this.navItem.panelDomId : null;
  }

  @HostBinding("attr.aria-selected")
  get _ariaSelected(): boolean {
    return this.navItem.active;
  }

  @HostBinding("attr.aria-disabled")
  get _ariaDisabled(): boolean {
    return this.navItem.disabled;
  }
}
