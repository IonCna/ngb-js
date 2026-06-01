import type { IController, IDirective } from "angular";

export class NgbNavLinkButton implements IController {
  $postLink(): void {}

  //#region $angular

  static get $name() {
    return "ngbNavLinkButton";
  }

  static get $factory(): () => IDirective {
    return () => ({
      controller: NgbNavLinkButton,
      bindToController: true,
    });
  }

  //#endregion
}
