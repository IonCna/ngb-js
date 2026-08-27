import template from "@ngb/popover/ngb-popover-window.html";
import angular, {
  type IAugmentedJQuery,
  type IComponentController,
  type IComponentOptions,
  type IOnChangesObject,
} from "angular";
import { TemplateRef } from "ngjs-core";

export class NgbPopoverWindow implements IComponentController {
  public animation?: boolean;
  public title?: string | TemplateRef<any> | null;
  public id?: string;
  public popoverClass?: string;
  public context?: any;
  public onMouseEnter?: () => void;
  public onMouseLeave?: () => void;

  constructor(private readonly $element: IAugmentedJQuery) {}

  $postLink(): void {
    this.$element.addClass("popover");
    this.$element.attr("role", "tooltip");
    this.$element.css("position", "absolute");
  }

  $onChanges(changes?: IOnChangesObject): void {
    if (this.id) {
      this.$element.attr("id", this.id);
    } else {
      this.$element.removeAttr("id");
    }

    this.$element.toggleClass("fade", this.animation);

    const previousPopoverClass = changes?.popoverClass?.previousValue;
    if (typeof previousPopoverClass === "string" && previousPopoverClass) {
      this.$element.removeClass(previousPopoverClass);
    }

    if (this.popoverClass) {
      this.$element.addClass(this.popoverClass);
    }

    if (this.onMouseEnter || this.onMouseLeave) {
      this.$element.off("mouseenter");
      this.$element.off("mouseleave");
      this.$element.on("mouseenter", this.onMouseEnter?.bind(this) ?? angular.noop);
      this.$element.on("mouseleave", this.onMouseLeave?.bind(this) ?? angular.noop);
    }
  }

  $onDestroy(): void {
    this.$element.off("mouseenter");
    this.$element.off("mouseleave");
  }

  isTitleTemplate(): boolean {
    return this.title instanceof TemplateRef;
  }

  static get $inject() {
    return ["$element"];
  }

  static get $factory(): IComponentOptions {
    return {
      bindings: {
        animation: "<?",
        title: "<?",
        id: "<?",
        popoverClass: "@?",
        context: "<?",
        onMouseEnter: "&?",
        onMouseLeave: "&?",
      },
      controller: NgbPopoverWindow,
      controllerAs: "$",
      transclude: true,
      template,
    };
  }

  static get $name() {
    return "ngbPopoverWindow";
  }
}
