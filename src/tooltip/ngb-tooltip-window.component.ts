import template from "@ngb/tooltip/ngb-tooltip-window.component.html";
import type { IComponentController, IComponentOptions, IOnChangesObject } from "angular";
import angular from "angular";

export class NgbTooltipWindow implements IComponentController {
  public id?: string;
  public animation?: boolean;
  public tooltipClass?: string;
  public onMouseEnter?: () => void;
  public onMouseLeave?: () => void;

  constructor(private readonly $element: JQLite) {}

  $postLink(): void {
    this.$element.attr("role", "tooltip");
    this.$element.addClass("tooltip");
  }

  $onChanges(changes?: IOnChangesObject): void {
    if (this.id) {
      this.$element.attr("id", this.id);
    } else {
      this.$element.removeAttr("id");
    }

    this.$element.toggleClass("fade", this.animation);

    const previousTooltipClass = changes?.tooltipClass?.previousValue;
    if (typeof previousTooltipClass === "string" && previousTooltipClass) {
      this.$element.removeClass(previousTooltipClass);
    }

    if (this.tooltipClass) {
      this.$element.addClass(this.tooltipClass);
    }

    if (this.onMouseEnter || this.onMouseLeave) {
      this.$element.off("mouseenter");
      this.$element.off("mouseleave");

      this.$element.on("mouseenter", this.onMouseEnter?.bind(this) ?? angular.noop);
      this.$element.on("mouseleave", this.onMouseLeave?.bind(this) ?? angular.noop);
    }
  }

  static get $inject() {
    return ["$element"];
  }

  static get $factory(): IComponentOptions {
    return {
      controller: NgbTooltipWindow,
      controllerAs: "$",
      bindings: {
        animation: "<?",
        id: "<?",
        tooltipClass: "@?",
        onMouseEnter: "&?",
        onMouseLeave: "&?",
      },
      transclude: true,
      template,
    };
  }

  static get $name() {
    return "ngbTooltipWindow";
  }
}
