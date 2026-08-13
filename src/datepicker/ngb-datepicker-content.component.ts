import type { ContentTemplateContext } from "@ngb/datepicker/ngb-datepicker-content-template-context.ts";
import type { IController, IDirective } from "angular";
import type { TemplateRef } from "ngjs-core";

/**
 * Marks the template used to customize how the datepicker months are rendered.
 */
export class NgbDatepickerContent implements IController {
  public templateRef!: TemplateRef<ContentTemplateContext>;

  static get $name() {
    return "ngbDatepickerContent";
  }

  static $factory(): IDirective {
    return {
      controller: NgbDatepickerContent,
      bindToController: true,
      restrict: "A",
      require: {
        templateRef: "ngTemplate",
      },
    };
  }
}
