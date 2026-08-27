import type { IDirective } from "angular";
import type { TemplateRef } from "ngjs-core";

export class NgbPaginationPages {
  public templateRef!: TemplateRef<any>;

  static get $name() {
    return "ngbPaginationPages";
  }

  static $factory(): IDirective {
    return {
      restrict: "A",
      bindToController: true,
      controller: NgbPaginationPages,
      require: {
        templateRef: "ngTemplate",
      },
    };
  }
}
