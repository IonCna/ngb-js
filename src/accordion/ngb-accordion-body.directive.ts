import type { NgbAccordionItem } from "@ngb/accordion/ngb-accordion-item.directive";
import type { IAugmentedJQuery, IController, IDirective } from "angular";

export class NgbAccordionBody implements IController {
  protected item!: NgbAccordionItem;

  constructor(private readonly $element: IAugmentedJQuery) {}

  $postLink(): void {
    this.$element.addClass("accordion-body");
  }

  static get $name() {
    return "ngbAccordionBody";
  }

  static get $inject() {
    return ["$element"];
  }

  static get $factory(): () => IDirective {
    return () => ({
      controller: NgbAccordionBody,
      bindToController: true,
      controllerAs: "$",
      require: {
        item: "^^ngbAccordionItem",
      },
      scope: true,
      restrict: "A",
      transclude: true,
      template: `<ng-transclude ng-if="$.item._shouldBeInDOM"></ng-transclude>`,
    });
  }
}
