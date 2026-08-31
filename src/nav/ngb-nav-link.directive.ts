import { NgbNavLinkBase } from "@ngb/nav/ngb-nav-link-base.directive";
import type { IAttributes, IAugmentedJQuery, IDirective, IScope } from "angular";

export class NgbNavLink extends NgbNavLinkBase {
  constructor(
    $element: IAugmentedJQuery,
    public $attrs: IAttributes,
    $scope: IScope
  ) {
    super($element, $attrs, $scope)
  }

  override $postLink(): void {
    super.$postLink();

    const tag = this.nativeElement.tagName.toLowerCase();

    if (tag === "button") {
      this._setupButton();
      return
    }

    if (tag !== "a") {
      return
    }

    const hasAttrs = Object.hasOwn(this.$attrs.$attr, "uiSref")

    if(!hasAttrs) {
      this.$element.attr("href", "");
    }

    this._clickHandler = (event) => {
      if(!hasAttrs) {
        event.preventDefault();
      }

      this.$scope.$evalAsync(() => this.ngbNav.click(this.ngbNavItem));
    };
    this.$element.on("click", this._clickHandler);
  }

  //#region $angular

  static get $name() {
    return "ngbNavLink";
  }

  static get $inject() {
    return ["$element", "$attrs", "$scope"]
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
