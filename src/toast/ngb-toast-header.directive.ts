import type { IDirective } from "angular";

export class NgbToastHeader {
  static get $name() {
    return "ngbToastHeader";
  }

  static get $factory(): () => IDirective {
    return () => ({
      bindToController: true,
      controller: NgbToastHeader,
      restrict: "A",
    });
  }
}
