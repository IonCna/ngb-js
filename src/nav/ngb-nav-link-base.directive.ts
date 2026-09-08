import { NgbNav } from "@ngb/nav/ngb-nav.directive";
import { NgbNavItem } from "@ngb/nav/ngb-nav-item.directive";
import { Attribute, Directive, ElementRef, HostBinding, HostListener, inject } from "ngjs-core";

/**
 * ng-bootstrap tiene tres directivas — `NgbNavLinkBase` (`[ngbNavLink]`),
 * `NgbNavLink` (`a[ngbNavLink]`) y `NgbNavLinkButton` (`button[ngbNavLink]`).
 * AngularJS no deja tres directivas con el mismo nombre y todas con controller
 * (`$compile:multidir`), así que acá van integradas en una sola, ramificando por
 * `tagName`. `NgbNavLink` / `NgbNavLinkButton` quedan como subclases finas para
 * compatibilidad de import, pero no se registran. Ver CORE_GAPS.md.
 */
@Directive({
  selector: "[ngbNavLink]",
})
export class NgbNavLinkBase {
  navItem = inject(NgbNavItem);
  nav = inject(NgbNav);
  nativeElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  private get _isAnchor(): boolean {
    return this.nativeElement.tagName === "A";
  }

  private get _isButton(): boolean {
    return this.nativeElement.tagName === "BUTTON";
  }

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

  // --- específico de `a[ngbNavLink]` ---

  @HostBinding("attr.href")
  get _href(): string | undefined {
    return this._isAnchor ? "" : undefined;
  }

  // --- específico de `button[ngbNavLink]` ---

  @HostBinding("attr.type")
  get _type(): string | undefined {
    return this._isButton ? "button" : undefined;
  }

  @HostBinding("disabled")
  get _disabled(): boolean {
    return this._isButton && this.navItem.disabled;
  }

  @HostListener("click", ["$event"])
  _click(event: MouseEvent): void {
    this.nav.click(this.navItem);
    if (this._isAnchor) event.preventDefault();
  }
}
