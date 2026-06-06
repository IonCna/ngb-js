import type { NgbNav } from "@ngb/nav/ngb-nav.directive";
import type { NgbNavItem } from "@ngb/nav/ngb-nav-item.directive";
import { assertAttribute } from "@ngb/utils";
import type { IAttributes, IAugmentedJQuery, IController, IDirective } from "angular";

export class NgbNavPane implements IController {
  item!: NgbNavItem;
  nav!: NgbNav;

  constructor(
    public $element: IAugmentedJQuery,
    private $attrs: IAttributes,
  ) {}

  $postLink(): void {
    this.$element.addClass("tab-pane");
    if (this.nav.animation) this.$element.addClass("fade");

    this.$element.attr("id", this.item.panelDomId);
    this.$element.attr("aria-labelledby", this.item.domId);
    assertAttribute(this.$element, "role", this.$attrs["role"], this.nav.roles ? "tabpanel" : undefined);

    if (this.item.contentTpl) {
      this.item.contentTpl.$transclude((cloned) => this.$element.append(cloned));
    }
  }

  //#region $angular

  static get $name() {
    return "ngbNavPane";
  }

  static get $inject() {
    return ["$element", "$attrs"];
  }

  static get $factory(): () => IDirective {
    return () => ({
      controller: NgbNavPane,
      restrict: "A",
      scope: {
        item: "<",
        nav: "<",
      },
      bindToController: true,
    });
  }

  //#endregion
}
