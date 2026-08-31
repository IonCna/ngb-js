import template from "@ngb/accordion/ngb-accordion-collapse.directive.html";
import type { NgbAccordionItem } from "@ngb/accordion/ngb-accordion-item.directive";
import { NgbCollapse } from "@ngb/collapse/ngb-collapse.directive";
import type { IController, IDirective } from "angular";
import { ViewChild } from "ngjs-core";

export class NgbAccordionCollapse implements IController {
  item!: NgbAccordionItem;

  @ViewChild(NgbCollapse, { static: true })
  ngbCollapse!: NgbCollapse;

  static get $name() {
    return "ngbAccordionCollapse";
  }

  static get $inject() {
    return [];
  }

  static get $factory(): () => IDirective {
    return () => ({
      bindToController: true,
      scope: true,
      require: {
        item: "^ngbAccordionItem",
      },
      restrict: "A",
      transclude: true,
      controllerAs: "$",
      template,
      controller: NgbAccordionCollapse,
    });
  }
}
