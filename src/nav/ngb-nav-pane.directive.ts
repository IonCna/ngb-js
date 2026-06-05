import type { IAugmentedJQuery, IController, IDirective, IScope } from "angular";
import type { NgbNav } from "./ngb-nav.directive";
import type { NgbNavItem } from "./ngb-nav-item.directive";

export class NgbNavPane implements IController {
  item!: NgbNavItem;
  nav!: NgbNav;

  constructor(
    public $element: IAugmentedJQuery,
    private $scope: IScope,
  ) {}

  $onInit(): void {
    this.$scope.$watch(
      () => this.item.panelDomId,
      (id) => {
        this.$element.attr("id", id);
      },
    );
  }

  $postLink(): void {
    this.$element.addClass("tab-pane");
  }

  $onChanges(): void {}

  //#region $angular

  static get $name() {
    return "ngbNavPane";
  }

  static get $inject() {
    return ["$element", "$scope"];
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
