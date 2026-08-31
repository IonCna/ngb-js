import type { NgbNav } from "@ngb/nav/ngb-nav.directive";
import type { NgbNavItem } from "@ngb/nav/ngb-nav-item.directive";
import { assertAttribute } from "@ngb/utils";
import type { IAugmentedJQuery, IController, IDirective } from "angular";

export class NgbNavPane implements IController {
  item!: NgbNavItem;
  nav!: NgbNav;
  role?: string;
  nativeElement!: HTMLElement;

  constructor(public $element: IAugmentedJQuery) {}

  $postLink(): void {
    this.nativeElement = this.$element[0] as HTMLElement;
    this.$element.addClass("tab-pane");
    if (this.nav.animation) this.$element.addClass("fade");

    this.$element.attr("id", this.item.panelDomId);
    this.$element.attr("aria-labelledby", this.item.domId);
    assertAttribute(this.$element, "role", this.role, this.nav.roles ? "tabpanel" : undefined);
  }

  //#region $angular

  static get $name() {
    return "ngbNavPane";
  }

  static get $inject() {
    return ["$element"];
  }

  static get $factory(): () => IDirective {
    return () => ({
      controller: NgbNavPane,
      controllerAs: "$",
      restrict: "A",
      scope: {
        item: "<",
        nav: "<",
        role: "<?",
      },
      bindToController: true,
      transclude: true,
      template: "<ng-content></ng-content>",
    });
  }

  //#endregion
}
