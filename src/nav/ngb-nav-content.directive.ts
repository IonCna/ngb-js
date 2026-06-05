import type { NgbNavItem } from "@ngb/nav/ngb-nav-item.directive";
import type { IController, IDirective, ITranscludeFunction } from "angular";

export class NgbNavContent implements IController {
  private item!: NgbNavItem;
  constructor(public $transclude: ITranscludeFunction) {}

  $postLink(): void {
    this.item.register(this);
  }

  //#region $angular

  static get $inject() {
    return ["$transclude"];
  }

  static get $name() {
    return "ngbNavContent";
  }

  static get $factory(): () => IDirective {
    return () => ({
      controller: NgbNavContent,
      bindToController: true,
      transclude: true,
      restrict: "A",
      require: {
        item: "^ngbNavItem",
      },
    });
  }

  //#endregion
}
