import { NgbNavLinkBase } from "@ngb/nav/ngb-nav-link-base.directive";
import type { IDirective } from "angular";

export class NgbNavLinkButton extends NgbNavLinkBase {
  override $postLink(): void {
    super.$postLink();
    this._setupButton();
  }

  //#region $angular

  static get $name() {
    return "ngbNavLinkButton";
  }

  static get $factory(): () => IDirective {
    return () => ({
      controller: NgbNavLinkButton,
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
