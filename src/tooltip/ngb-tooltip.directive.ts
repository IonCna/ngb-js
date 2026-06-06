import { NgbTooltipConfig } from "@ngb/tooltip/ngb-tooltip-config.service";
import { toNativeElement } from "@ngb/utils";
import angular, { isString, type IAugmentedJQuery, type IController, type IDirective } from "angular";

export class NgbTooltip implements IController {
  static ngAcceptInputType_autoClose: boolean | string;
  public positionTarget?: string;
  public animation!: boolean;

  constructor(
    private _config: NgbTooltipConfig,
    private $element: IAugmentedJQuery,
  ) {}

  $onDestroy(): void {}

  public close(animation = this.animation) {}

  private _getPositionTargetElement() {
    const native = toNativeElement(this.$element);
    const target = document.querySelector(this.positionTarget ?? "");

    return angular.element(target ?? native);
  }

  static get $inject() {
    return [NgbTooltipConfig.$name, "$element"];
  }

  static get $factory(): () => IDirective {
    return () => ({
      controller: NgbTooltip,
      bindToController: {
        animation: "<?",
        autoClose: "<?",
        placement: "<?",
        popperOptions: "<?",
        triggers: "<?",
        positionTarget: "@?",
        container: "<?",
        disableTooltip: "<?",
        tooltipClass: "@?",
        tooltipContext: "<?",
        openDelay: "<?",
        closeDelay: "<?",
        shown: "&?",
        hidden: "&?",
      },
      scope: true,
      restrict: "A",
    });
  }

  static get $name() {
    return "ngbTooltip";
  }
}
