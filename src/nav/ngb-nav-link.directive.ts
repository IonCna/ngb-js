import type { NgbNav } from "@ngb/nav/ngb-nav.directive";
import type { NgbNavItem } from "@ngb/nav/ngb-nav-item.directive";
import { assertAttribute, toNativeElement } from "@ngb/utils";
import type { IAttributes, IAugmentedJQuery, IController, IDirective } from "angular";
import type { Subscription } from "rxjs";

export class NgbNavLink implements IController {
  public ngbNavItem!: NgbNavItem;
  public nativeElement!: HTMLElement;
  private ngbNav!: NgbNav;
  private _sub?: Subscription;

  constructor(
    private $element: IAugmentedJQuery,
    private $attrs: IAttributes,
  ) {}

  $postLink(): void {
    this.$element.addClass("nav-link");
    this.nativeElement = toNativeElement(this.$element);

    this._updateDom();
    this._sub = this.ngbNav.navItemChange$.subscribe(() => this._updateDom());
  }

  $onDestroy(): void {
    this._sub?.unsubscribe();
  }

  get tabindex(): number | undefined {
    if (this.ngbNav.keyboard === false) {
      return this.ngbNavItem.disabled ? -1 : undefined;
    }
    if (this.ngbNav._navigatingWithKeyboard) {
      return -1;
    }
    return this.ngbNavItem.disabled || !this.ngbNavItem.active ? -1 : undefined;
  }

  private _updateDom(): void {
    const item = this.ngbNavItem;
    const nav = this.ngbNav;
    const role = this.$attrs["role"];

    this.$element.attr("id", item.domId);
    this.$element.toggleClass("nav-item", item.isNgContainer());
    this.$element.toggleClass("active", !!item.active);
    this.$element.toggleClass("disabled", !!item.disabled);

    assertAttribute(this.$element, "tabindex", this.tabindex?.toString());
    assertAttribute(this.$element, "aria-controls", item.isPanelInDom() ? item.panelDomId : undefined);
    assertAttribute(this.$element, "aria-selected", String(item.active));
    assertAttribute(this.$element, "aria-disabled", item.disabled ? "true" : undefined);
    assertAttribute(this.$element, "role", role, nav.roles ? "tab" : undefined);
  }

  //#region $angular

  static get $inject() {
    return ["$element", "$attrs"];
  }

  static get $name() {
    return "ngbNavLink";
  }

  static get $factory(): () => IDirective {
    return () => ({
      controller: NgbNavLink,
      require: {
        ngbNavItem: "^ngbNavItem",
        ngbNav: "^ngbNav",
      },
      restrict: "A",
      bindToController: true,
    });
  }

  //#endregion
}
