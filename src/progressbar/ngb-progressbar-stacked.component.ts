import type { IAugmentedJQuery, IComponentController, IComponentOptions } from "angular";

export class NgbProgressbarStacked implements IComponentController {
  constructor(private readonly $element: IAugmentedJQuery) {}

  $postLink(): void {
    this.$element.addClass("progress-stacked");
  }

  static get $name() {
    return "ngbProgressbarStacked";
  }

  static get $inject() {
    return ["$element"];
  }

  static get $factory(): IComponentOptions {
    return {
      controller: NgbProgressbarStacked,
      controllerAs: "$",
    };
  }
}
