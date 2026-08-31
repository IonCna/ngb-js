import type { IDirective } from "angular";

export class NgbNavContent {
  //#region $angular

  static get $name() {
    return "ngbNavContent";
  }

  static get $factory(): () => IDirective {
    return () => ({
      controller: NgbNavContent,
      bindToController: true,
      restrict: "A",
    });
  }

  //#endregion
}
