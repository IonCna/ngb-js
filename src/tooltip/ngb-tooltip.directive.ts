import { NgbTooltipConfig } from "@ngb/tooltip/ngb-tooltip-config.service";
import { NgbTooltipWindow } from "@ngb/tooltip/ngb-tooltip-window.component";
import { ngbCompleteTransition, toNativeElement } from "@ngb/utils";
import { type IPopupService, PopupFactory } from "@ngb/utils/popup.service";
import angular, { type IAugmentedJQuery, type IController, type IDirective, type ITranscludeFunction } from "angular";

export class NgbTooltip implements IController {
  static ngAcceptInputType_autoClose: boolean | string;
  public positionTarget?: string;
  public animation!: boolean;

  private _ngbTooltip?: string | ITranscludeFunction;
  private _windowRef: unknown;

  private _transitioning = false;
  private _opening = true;
  private popupService!: IPopupService<NgbTooltipWindow>;

  constructor(
    private _config: NgbTooltipConfig,
    private $element: IAugmentedJQuery,
    private popupFactory: PopupFactory,
  ) {}

  $onInit(): void {
    this.popupService = this.popupFactory.$create<NgbTooltipWindow>(NgbTooltipWindow.$name);
  }

  public open(context?: any) {}

  $onDestroy(): void {}

  private _getPositionTargetElement() {
    const native = toNativeElement(this.$element);
    const target = document.querySelector(this.positionTarget ?? "");

    return angular.element(target ?? native);
  }

  set ngbTooltip(value: string | ITranscludeFunction) {
    this._ngbTooltip = value;

    if (!value && this) {
    }
  }

  static get $inject() {
    return [NgbTooltipConfig.$name, "$element", PopupFactory.$name];
  }

  static get $factory(): () => IDirective {
    return () => ({
      controller: NgbTooltip,
      bindToController: {
        ngbTooltip: "<?",
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
