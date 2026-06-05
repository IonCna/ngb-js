import type { NgbNav } from "@ngb/nav/ngb-nav.directive";
import type { NgbNavItem } from "@ngb/nav/ngb-nav-item.directive";
import { toNativeElement } from "@ngb/utils";
import type { IAugmentedJQuery, IController, IDirective, IScope } from "angular";

export class NgbNavLink implements IController {
  public ngbNavItem!: NgbNavItem;
  public nativeElement!: HTMLElement;
  private ngbNav!: NgbNav;
  private itemWatcher?: () => void;

  constructor(
    private $element: IAugmentedJQuery,
    private $scope: IScope,
  ) {}

  $onInit(): void {
    this.itemWatcher = this.$scope.$watch(
      () => this.ngbNavItem,
      (nav) => {
        this.$element.toggleClass("nav-item", nav.isNgContainer());
        this.$element.toggleClass("active", nav.active);
        this.$element.toggleClass("disabled", nav.disabled);

        this.$element.attr("id", nav.domId);
      },
    );
  }

  get tabindex() {
    if (this.ngbNav.keyboard === false) {
      return this.ngbNavItem.disabled ? -1 : undefined;
    }

    if (this.ngbNav._navigatingWithKeyboard) {
      return -1;
    }

    return this.ngbNavItem.disabled || !this.ngbNavItem.active ? -1 : undefined;
  }

  $postLink(): void {
    this.$element.addClass("nav-link");

    if (this.tabindex) {
      this.$element.attr("tabindex", this.tabindex);
    }

    this.nativeElement = toNativeElement(this.$element);
  }

  $onDestroy(): void {
    this.itemWatcher?.();
  }

  //#region $angular

  static get $inject() {
    return ["$element", "$scope"];
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
