import template from "@ngb/accordion/ngb-accordion-collapse.directive.html";
import type { NgbAccordionItem } from "@ngb/accordion/ngb-accordion-item.directive";
import type { NgbCollapse } from "@ngb/collapse/ngb-collapse.directive";
import type { IController, IDirective } from "angular";
import { Subject } from "rxjs";

export class NgbAccordionCollapse implements IController {
  protected item!: NgbAccordionItem;

  _collapse!: NgbCollapse;
  hidden$ = new Subject<void>();
  shown$ = new Subject<void>();

  $postLink(): void {
    this.item.register(this);
  }

  register(collapse: NgbCollapse) {
    this._collapse = collapse;
  }

  hidden() {
    this.hidden$.next();
  }

  shown() {
    this.shown$.next();
  }

  $onDestroy(): void {
    this.hidden$.complete();
    this.shown$.complete();
  }

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
