import type { NgbNav } from "@ngb/nav/ngb-nav.directive";
import { assertAttribute } from "@ngb/utils";
import type { IAttributes, IAugmentedJQuery, IController, IDirective } from "angular";

export class NgbNavItemRole implements IController {
  public nav!: NgbNav;
  constructor(
    private $attributes: IAttributes,
    private $element: IAugmentedJQuery,
  ) {}

  $onInit(): void {
    this.$attributes.$observe("role", (role?: string) => {
      assertAttribute(this.$element, "role", role, this.nav.roles ? "presentation" : undefined);
    });
  }

  //#region $angular

  static get $name() {
    return "ngbNavItemRole";
  }

  static get $inject() {
    return ["$attrs", "$element"];
  }

  static get $factory(): () => IDirective {
    return () => ({
      controller: NgbNavItemRole,
      bindToController: true,
      require: {
        nav: "^ngbNav",
      },
      restrict: "A",
    });
  }

  //#endregion
}
