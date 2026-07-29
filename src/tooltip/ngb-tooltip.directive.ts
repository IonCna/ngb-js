import { NgbTooltipConfig } from "@ngb/tooltip/ngb-tooltip-config.service";
import { NgbTooltipWindow } from "@ngb/tooltip/ngb-tooltip-window.component";
import { ngbCompleteTransition, toNativeElement } from "@ngb/utils";
import { ngbAutoClose, SOURCE } from "@ngb/utils/autoclose";
import { DigestService } from "@ngb/utils/digest.service";
import { type NgbPositioning, ngbPositioning, type PlacementArray } from "@ngb/utils/positioning";
import { addPopperOffset } from "@ngb/utils/positioning.util";
import { type ContentRef, type IPopupService, PopupFactory } from "@ngb/utils/popup.service";
import { NgbRTL } from "@ngb/utils/rtl.service";
import { listenToTriggers } from "@ngb/utils/triggers";
import type { Options } from "@popperjs/core";
import angular, {
  type IAugmentedJQuery,
  type IAttributes,
  type IController,
  type IDirective,
  type IOnChangesObject,
  type IScope,
  type ITimeoutService,
  type ITranscludeFunction,
} from "angular";
import { Subject } from "rxjs";

let nextId = 0;

export class NgbTooltip implements IController {
  static ngAcceptInputType_autoClose: boolean | string;
  public positionTarget?: string;
  public animation!: boolean;
  public autoClose!: boolean | "inside" | "outside";
  public placement!: PlacementArray;
  public popperOptions!: (options: Partial<Options>) => Partial<Options>;
  public triggers!: string;
  public container?: string;
  public disableTooltip!: boolean;
  public tooltipClass?: string;
  public tooltipContext?: any;
  public openDelay!: number;
  public closeDelay!: number;

  private _ngbTooltip?: string | ITranscludeFunction;
  private _ngbTooltipWindowId = `ngb-tooltip-${nextId++}`;
  private _windowRef: ContentRef<NgbTooltipWindow> | null = null;
  private _positioning!: NgbPositioning;
  private _unlistenTriggers?: () => void;
  private _unwatchPositioning?: () => void;
  private _destroyCloseHandlers$ = new Subject<void>();

  private _transitioning = false;
  private _opening = true;
  private popupService!: IPopupService<NgbTooltipWindow>;
  private shown?: () => void;
  private hidden?: () => void;

  constructor(
    private _config: NgbTooltipConfig,
    private $element: IAugmentedJQuery,
    private popupFactory: PopupFactory,
    private $ngbRTL: NgbRTL,
    private $timeout: ITimeoutService,
    private $scope: IScope,
    private $digestService: DigestService,
    private $attrs: IAttributes,
  ) {}

  $onInit(): void {
    this.popupService = this.popupFactory.$create<NgbTooltipWindow>(NgbTooltipWindow.$name);
    this._positioning = ngbPositioning(this.$ngbRTL);
    this.animation = this.animation ?? this._config.animation;
    this.autoClose = this.autoClose ?? this._config.autoClose;
    this.placement = this.placement ?? this._config.placement;
    this.popperOptions = this.popperOptions ?? this._config.popperOptions;
    this.triggers = this.triggers ?? this._config.triggers;
    this.container = this.container ?? this._config.container;
    this.disableTooltip = this.disableTooltip ?? this._config.disableTooltip;
    this.tooltipClass = this.tooltipClass ?? this._config.tooltipClass;
    this.openDelay = this.openDelay ?? this._config.openDelay;
    this.closeDelay = this.closeDelay ?? this._config.closeDelay;
    this._ngbTooltip = this._ngbTooltip ?? this.$attrs.ngbTooltip;
  }

  $postLink(): void {
    this._listenToTriggers();
  }

  $onChanges(changes: IOnChangesObject): void {
    if (changes.triggers && !changes.triggers.isFirstChange()) {
      this._listenToTriggers();
    }

    if (changes.tooltipClass && this.isOpen()) {
      this._windowRef!.setInput("tooltipClass", changes.tooltipClass.currentValue);
    }

    if (this.isOpen() && (changes.placement || changes.popperOptions || changes.positionTarget)) {
      this._positioning.setOptions({
        hostElement: toNativeElement(this._getPositionTargetElement()),
        targetElement: toNativeElement(this._windowRef!.$element),
        placement: this.placement,
        baseClass: "bs-tooltip",
        updatePopperOptions: (options) => this.popperOptions(addPopperOffset([0, 6])(options)),
      });
      this._positioning.update();
    }

    if (this.isOpen() && changes.disableTooltip?.currentValue) {
      this.close();
    }
  }

  public open(context?: any) {
    if (!this._opening && this._transitioning) {
      this._transitioning = false;
      ngbCompleteTransition(this._windowRef!.$element);
    }

    if (this._windowRef || this.disableTooltip || !this._ngbTooltip) {
      this.$scope.$evalAsync();
      return;
    }

    const { windowRef, transition$ } = this.popupService.open(
      this._ngbTooltip,
      context ?? this.tooltipContext,
      this.animation,
    );
    this._opening = true;
    this._transitioning = true;
    this._windowRef = windowRef;

    windowRef.setInput("animation", this.animation);
    windowRef.setInput("tooltipClass", this.tooltipClass);
    windowRef.setInput("id", this._ngbTooltipWindowId);
    windowRef.setInput("onMouseEnter", () => this._mouseenterContent$.next());
    windowRef.setInput("onMouseLeave", () => this._mouseleaveContent$.next());

    toNativeElement(this._getPositionTargetElement()).setAttribute("aria-describedby", this._ngbTooltipWindowId);

    this._applyContainer();
    this._positioning.createPopper({
      hostElement: toNativeElement(this._getPositionTargetElement()),
      targetElement: toNativeElement(this._windowRef.$element),
      placement: this.placement,
      baseClass: "bs-tooltip",
      updatePopperOptions: (options) => this.popperOptions(addPopperOffset([0, 6])(options)),
    });
    Promise.resolve().then(() => this._positioning.update());
    this._watchPositioning();
    this._setCloseHandlers();

    transition$.subscribe(() => {
      if (this._transitioning) {
        this._transitioning = false;
        this._positioning.update();
        this.shown?.();
      }
    });

    this.$scope.$evalAsync();
  }

  public close(animation = this.animation): void {
    if (this._opening && this._transitioning) {
      this._transitioning = false;
      ngbCompleteTransition(this._windowRef!.$element);
    }

    if (!this._windowRef) return;

    this._opening = false;
    this._transitioning = true;
    this._destroyCloseHandlers$.next();
    toNativeElement(this._getPositionTargetElement()).removeAttribute("aria-describedby");

    this.popupService.close(animation).subscribe(() => {
      this._windowRef = null;
      this._positioning.destroy();
      this._unwatchPositioning?.();
      this._unwatchPositioning = undefined;
      if (this._transitioning) {
        this._transitioning = false;
        this.hidden?.();
      }
    });

    this.$scope.$evalAsync();
  }

  public toggle(): void {
    this._windowRef ? this.close() : this.open();
  }

  public isOpen(): boolean {
    return this._windowRef != null;
  }

  $onDestroy(): void {
    this.close(false);
    this._unlistenTriggers?.();
    this._destroyCloseHandlers$.next();
    this._destroyCloseHandlers$.complete();
  }

  private _mouseenterContent$ = new Subject<void>();
  private _mouseleaveContent$ = new Subject<void>();

  private _getPositionTargetElement() {
    const native = toNativeElement(this.$element);
    const target = this.positionTarget ? document.querySelector(this.positionTarget) : null;

    return angular.element(target ?? native);
  }

  private _applyContainer(): void {
    const container = this._getContainerElement();
    container.append(this._windowRef!.$element);
  }

  private _getContainerElement(): IAugmentedJQuery {
    if (!this.container) return this.$element.parent();

    if (this.container === "body") return angular.element(document.body);

    const container = document.querySelector(this.container);
    if (!container) {
      throw new Error(`[ngb-tooltip]: The specified container "${this.container}" was not found in the DOM.`);
    }

    return angular.element(container);
  }

  private _listenToTriggers(): void {
    this._unlistenTriggers?.();
    this._unlistenTriggers = listenToTriggers(
      this.$timeout,
      toNativeElement(this.$element),
      this.triggers,
      () => this.isOpen(),
      () => this.open(),
      () => this.close(),
      +this.openDelay,
      +this.closeDelay,
      this._mouseenterContent$,
      this._mouseleaveContent$,
    );
  }

  private _setCloseHandlers(): void {
    this._destroyCloseHandlers$.next();
    ngbAutoClose(
      this.$digestService,
      this.autoClose,
      this._destroyCloseHandlers$,
      (source: SOURCE) => {
        this.close();
        if (source === SOURCE.ESCAPE) {
          toNativeElement(this.$element).focus();
        }
      },
      this._windowRef ? [toNativeElement(this._windowRef.$element)] : [],
      [toNativeElement(this.$element)],
    );
  }

  private _watchPositioning(): void {
    this._unwatchPositioning?.();
    this._unwatchPositioning = this.$scope.$watch(() => {
      if (this._windowRef) {
        this._positioning.update();
      }
    });
  }

  set ngbTooltip(value: string | ITranscludeFunction) {
    this._ngbTooltip = value;

    if (!value && this.isOpen()) {
      this.close();
    }
  }

  static get $inject() {
    return [
      NgbTooltipConfig.$name,
      "$element",
      PopupFactory.$name,
      NgbRTL.$name,
      "$timeout",
      "$scope",
      DigestService.$name,
      "$attrs",
    ];
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
