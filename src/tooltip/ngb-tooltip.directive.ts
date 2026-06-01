import { NgbTooltipConfig } from "@ngb/tooltip/ngb-tooltip-config.service";
import { NgbTooltipWindow } from "@ngb/tooltip/ngb-tooltip-window.component";
import { ngbCompleteTransition, toNativeElement } from "@ngb/utils";
import { type ContentRef, type IPopupService, PopupFactory } from "@ngb/utils/popup.service";
import { ngbPositioning, type PlacementArray } from "@ngb/utils/positioning";
import { NgbRTL } from "@ngb/utils/rtl.service";
import { listenToTriggers } from "@ngb/utils/triggers";
import type { Options } from "@popperjs/core";
import type {
  IAugmentedJQuery,
  IController,
  IDeferred,
  IDocumentService,
  IQService,
  IScope,
  ITimeoutService,
  ITranscludeFunction,
} from "angular";
import angular from "angular";

function targetIsString(target: unknown): target is string {
  return angular.isString(target);
}

let nextId = 0;

export class NgbTooltip implements IController {
  static ngAcceptInputType_autoClose: boolean | string;
  private animation?: boolean;
  private autoClose?: boolean | "inside" | "outside";
  private placement?: PlacementArray;
  private popperOptions?: (options: Partial<Options>) => Options;
  private triggers?: string;
  private container?: string;
  private disableTooltip?: boolean;
  private tooltipClass?: string;
  private openDelay?: number;
  private closeDelay?: number;

  private tooltipContext?: unknown;
  private _popupService?: IPopupService;
  private _ngbTooltip?: string | ITranscludeFunction;
  private _ngbTooltipWindowId = `ngb-tooltip-${nextId++}`;

  private _unregisterListenersFn?: () => void;
  private _mouseEnterTooltip?: IDeferred<void>;
  private _mouseLeaveTooltip?: IDeferred<void>;

  private _windowRef: ContentRef<NgbTooltipWindow> | null = null;
  private _opening = true;
  private _transitioning = false;

  constructor(
    private $config: NgbTooltipConfig,
    private $element: IAugmentedJQuery,
    private $document: IDocumentService,
    private $timeout: ITimeoutService,
    private $q: IQService,
    private $popupFactory: PopupFactory,
    private $rtl: NgbRTL,
    _$scope: IScope,
  ) {}

  set ngbTooltip(value: string | ITranscludeFunction | null | undefined) {
    this._ngbTooltip = <any>value;
  }

  get ngbTooltip() {
    return this._ngbTooltip;
  }

  $onInit(): void {
    this._popupService = this.$popupFactory.$create(NgbTooltipWindow.$name);

    this.animation = this.animation ?? this.$config.animation;
    this.autoClose = this.autoClose ?? this.$config.autoClose;
    this.placement = this.placement ?? this.$config.placement;
    this.popperOptions = this.popperOptions ?? this.popperOptions;
    this.triggers = this.triggers ?? this.$config.triggers;
    this.container = this.container ?? this.$config.container;
    this.disableTooltip = this.disableTooltip ?? this.$config.disableTooltip;
    this.tooltipClass = this.tooltipClass ?? this.$config.tooltipClass;
    this.openDelay = this.openDelay ?? this.$config.openDelay;
    this.closeDelay = this.closeDelay ?? this.$config.closeDelay;

    this._mouseEnterTooltip = this.$q.defer();
    this._mouseLeaveTooltip = this.$q.defer();

    this._positioning = ngbPositioning(this.$rtl);

    this._unregisterListenersFn = listenToTriggers(
      this.$timeout,
      this.$q,
      this.$element,
      this.triggers,
      this.isOpen.bind(this),
      this.open.bind(this),
      this.close.bind(this),
      +this.openDelay,
      +this.closeDelay,
      this._mouseEnterTooltip.promise,
      this._mouseLeaveTooltip.promise,
    );
  }

  $onDestroy(): void {
    this.close(false);
    this._unregisterListenersFn?.();
  }

  $onChanges(changes: angular.IOnChangesObject): void {
    if (changes.tooltipClass && this.isOpen()) {
      this._windowRef?.setInput("tooltipClass", changes.tooltipClass.currentValue);
    }
  }

  public open(context?: any) {
    if (!this._opening && this._transitioning) {
      this._transitioning = false;
      ngbCompleteTransition(this._windowRef?.$element);
    }

    if (!this._windowRef && this._ngbTooltip && !this.disableTooltip) {
      const { windowRef, transition$ } = this._popupService?.open(
        this._ngbTooltip,
        context ?? this.tooltipContext,
        this.animation,
      );

      this._windowRef?.setInput("animation", this.animation);
      this._windowRef?.setInput("tooltipClass", this.tooltipClass);
      this._windowRef?.setInput("id", this._ngbTooltipWindowId);

      this._windowRef.setInput("onMouseEnter", () => this._mouseEnterTooltip?.notify());
      this._windowRef.setInput("onMouseLeave", () => this._mouseLeaveTooltip?.notify());

      console.log(this._windowRef);
    }
  }

  this;
  .
  _getPositionTargetElement();
  .
  attr('aria-describedby', this._ngbTooltipWindowId);

  if (this._container === 'body') {
                const body = this.$document.find("body");
                body.append(this._windowRef.$element);
            }

  this;
  .
  _windowRef;
  .
  $scope;
  ?.
  $evalAsync();

  this;
  .
  _positioning;
  ?.
  createPopper({
                hostElement: toNativeElement(this._getPositionTargetElement()
  ),
  targetElement: toNativeElement;
  (this._windowRef.$element)
  ,
  placement: this;
  .
  placement!
  ,
  baseClass: "bs-tooltip";
  ,
  updatePopperOptions: (options) => {
                    const offsetOptions = addPopperOffset([0;
  , 6])
                    return
  offsetOptions(options);
}
})

            this.$q.resolve().then(() =>
{
  this._positioning?.update();
}
)

            this._afterRenderRef = this.$timeout(() =>
{
  this._positioning?.update();
}
, 0)

            ngbAutoClose(
                this.$timeout,
                this.$document,
                this.autoClose!,
                this.$q.resolve().then(() => this.close()),
                this.hidden!,
                [this._windowRef.$element],
                [this.$element]
            )

            transition$.then(() =>
{
  if (this._transitioning) {
    this._transitioning = false;
    this.shown?.();
  }
}
)
        }
    }

    public toggle()
{
  if (this._windowRef) {
    this.close();
    return
  }

  this.open();
}

public
close((animation = this.animation));
{
  if (this._opening && this._transitioning) {
    this._transitioning = false;
    ngbCompleteTransition(this._windowRef?.$element);
  }

  if (this._windowRef != null) {
    this._getPositionTargetElement().removeAttr("aria-describedby");
    this._opening = false;
    this._transitioning = true;

    this._popupService?.close(animation).then(() => {
      this._windowRef = null;
      this._positioning?.destroy();
      this._afterRenderRef;

      if (this._transitioning) {
        this._transitioning = false;
        this.hidden?.();
      }

      this.$scope.$evalAsync();
    });
  }
}

public
isOpen();
{
  return this._windowRef != null
}

private
_getPositionTargetElement();
: IAugmentedJQuery
{
  if (targetIsString(this.positionTarget)) {
    const el = toNativeElement(this.$document).querySelector(this.positionTarget);
    return angular.element(el)
  }

  return this.positionTarget
}

static
get;
$inject();
{
  return [NgbTooltipConfig.$name, "$element", "$document", "$timeout", "$q", PopupFactory.$name, NgbRTL.$name, "$scope"]
}

static
get;
$name();
{
  return "ngbTooltip"
}

static
get;
$factory();
: () => IDirective
{
  return () => ({
            scope: true,
            bindToController: {
                animation: "<?",
                autoClose: "<?",
                closeDelay: "<?",
                container: "@?",
                disableTooltip: "<?",
                ngbTooltip: "<",
                openDelay: "<?",
                placement: "<?",
                popperOptions: "<?",
                positionTarget: "<?",
                tooltipClass: "@?",
                tooltipContext: "<?",
                triggers: "@?",
                hidden: "&?",
                shown: "&?"
            },
            controller: NgbTooltip,
            restrict: "A"
        })
}
}
