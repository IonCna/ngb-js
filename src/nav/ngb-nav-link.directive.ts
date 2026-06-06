import { NgbNavLinkBase } from "@ngb/nav/ngb-nav-link-base.directive";
import type { IDirective } from "angular";

export class NgbNavLink extends NgbNavLinkBase {
  override $postLink(): void {
    super.$postLink();

    const tag = this.nativeElement.tagName.toLowerCase();

    if (tag === "button") {
      this._setupButton();
    } else if (tag === "a") {
      this.$element.attr("href", "");
      this._clickHandler = (event) => {
        event.preventDefault();
        this.$scope.$evalAsync(() => this.ngbNav.click(this.ngbNavItem));
      };
      this.$element.on("click", this._clickHandler);
    }
  }

  //#region $angular

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