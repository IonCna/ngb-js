import type { IController, IDirective, ITranscludeFunction } from "angular";

export class NgbNavContent implements IController {
  constructor(private $transclude: ITranscludeFunction) {}

  public register() {
    return { content: this.$transclude };
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
    });
  }

  //#endregion
}
