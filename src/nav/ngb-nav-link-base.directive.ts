import type { NgbNav } from "@ngb/nav/ngb-nav.directive";
import type { NgbNavItem } from "@ngb/nav/ngb-nav-item.directive";
import { assertAttribute, toNativeElement } from "@ngb/utils";
import type { IAttributes, IAugmentedJQuery, IController, IScope } from "angular";
import type { Subscription } from "rxjs";

export class NgbNavLinkBase implements IController {
  public ngbNavItem!: NgbNavItem;
  public nativeElement!: HTMLElement;
  protected ngbNav!: NgbNav;

  private _sub?: Subscription;
  protected _clickHandler?: (event: JQueryEventObject) => void;
  protected _unwatchDisabled?: () => void;

  constructor(
    protected $element: IAugmentedJQuery,
    protected $attrs: IAttributes,
    protected $scope: IScope,
  ) {}

  $postLink(): void {
    this.$element.addClass("nav-link");
    this.nativeElement = toNativeElement(this.$element);
    this._updateDom();
    this._sub = this.ngbNav.navItemChange$.subscribe(() => this._updateDom());
    this._unwatchDisabled = this.$scope.$watch(
      () => this.ngbNavItem.isDisabled(),
      () => this._updateDom(),
    );
  }

  $onDestroy(): void {
    this._sub?.unsubscribe();
    this._unwatchDisabled?.();
    if (this._clickHandler) this.$element.off("click", this._clickHandler);
  }

  get tabindex(): number | undefined {
    if (this.ngbNav.keyboard === false) {
      return this.ngbNavItem.isDisabled() ? -1 : undefined;
    }
    if (this.ngbNav._navigatingWithKeyboard) {
      return -1;
    }
    return this.ngbNavItem.isDisabled() || !this.ngbNavItem.active ? -1 : undefined;
  }

  protected _setupButton(): void {
    this.$element.attr("type", "button");
    this._clickHandler = () => this.$scope.$evalAsync(() => this.ngbNav.click(this.ngbNavItem));
    this.$element.on("click", this._clickHandler);
  }

  protected _updateDom(): void {
    const item = this.ngbNavItem;
    const nav = this.ngbNav;
    const role = this.$attrs["role"];

    this.$element.attr("id", item.domId);
    this.$element.toggleClass("nav-item", item.isNgContainer());
    this.$element.toggleClass("active", !!item.active);
    this.$element.toggleClass("disabled", item.isDisabled());
    if (this.nativeElement instanceof HTMLButtonElement) {
      this.$element.prop("disabled", item.isDisabled());
    }

    assertAttribute(this.$element, "tabindex", this.tabindex?.toString());
    assertAttribute(this.$element, "aria-controls", item.isPanelInDom() ? item.panelDomId : undefined);
    assertAttribute(this.$element, "aria-selected", String(item.active));
    assertAttribute(this.$element, "aria-disabled", item.isDisabled() ? "true" : undefined);
    assertAttribute(this.$element, "role", role, nav.roles ? "tab" : undefined);
  }

  static get $inject() {
    return ["$element", "$attrs", "$scope"];
  }
}
