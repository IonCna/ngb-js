import type { NgbScrollSpy } from "@ngb/scrollspy/ngb-scrollspy.directive";
import type { IController, IDirective } from "angular";

export class NgbScrollSpyFragment implements IController {
  public id!: string;
  public ngbScrollSpy!: NgbScrollSpy;

  constructor(public $element: JQLite) {}

  $postLink(): void {
    this.$element.attr("id", this.id);
    this.ngbScrollSpy._registerFragment(this);
  }

  $onChanges(): void {
    this.$element.attr("id", this.id);
  }

  $onDestroy(): void {
    this.ngbScrollSpy._unregisterFragment(this);
  }

  //#region $angular

  static get $name() {
    return "ngbScrollSpyFragment";
  }

  static get $factory(): () => IDirective {
    return () => ({
      bindToController: {
        id: "@ngbScrollSpyFragment",
      },
      controller: NgbScrollSpyFragment,
      require: {
        ngbScrollSpy: "^ngbScrollSpy",
      },
      scope: true,
      restrict: "A",
    });
  }

  static get $inject() {
    return ["$element"];
  }

  //#endregion
}
