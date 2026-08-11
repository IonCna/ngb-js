import { NgbPopoverConfig } from "@ngb/popover/ngb-popover-config.service";
import { NgbPopoverWindow } from "@ngb/popover/ngb-popover-window";
import { ngbCompleteTransition, toNativeElement } from "@ngb/utils";
import { ngbAutoClose } from "@ngb/utils/autoclose";
import { type ContentRef, type IPopupService, PopupFactory } from "@ngb/utils/popup.service";
import { type NgbPositioning, ngbPositioning, type PlacementArray } from "@ngb/utils/positioning";
import { addPopperOffset } from "@ngb/utils/positioning.util";
import { NgbRTL } from "@ngb/utils/rtl.service";
import { listenToTriggers } from "@ngb/utils/triggers";
import type { Options } from "@popperjs/core";
import type { IAugmentedJQuery, IController, IDirective, IOnChangesObject, IScope, ITimeoutService } from "angular";
import { ChangeDetectorRef, NgZone, type TemplateRef } from "ngjs-core";
import { Subject } from "rxjs";

let nextId = 0;

export class NgbPopover implements IController {
  static ngAcceptInputType_autoClose: boolean | string;

  public animation!: boolean;
  public autoClose!: boolean | "inside" | "outside";
  public ngbPopover?: string | TemplateRef<any> | null;
  public popoverTitle?: string | TemplateRef<any> | null;
  public placement!: PlacementArray;
  public popperOptions!: (options: Partial<Options>) => Partial<Options>;
  public triggers!: string;
  public positionTarget?: string | HTMLElement;
  public container?: string;
  public disablePopover!: boolean;
  public popoverClass?: string;
  public popoverContext?: any;
  public openDelay!: number;
  public closeDelay!: number;

  protected shown?: () => void;
  protected hidden?: () => void;

  private _nativeElement: HTMLElement;
  private _ngbPopoverWindowId = `ngb-popover-${nextId++}`;
  private _popupService!: IPopupService<NgbPopoverWindow>;
  private _windowRef: ContentRef<NgbPopoverWindow> | null = null;
  private _unregisterListenersFn?: () => void;
  private _positioning!: NgbPositioning;
  private _afterRenderRef?: () => void;
  private _hidden$ = new Subject<void>();

  private _mouseEnterPopover = new Subject<void>();
  private _mouseLeavePopover = new Subject<void>();

  private _opening = true;
  private _transitioning = false;

  constructor(
    private readonly _config: NgbPopoverConfig,
    private readonly $element: IAugmentedJQuery,
    private readonly _popupFactory: PopupFactory,
    private readonly _rtl: NgbRTL,
    private readonly $timeout: ITimeoutService,
    private readonly $scope: IScope,
    private readonly _ngZone: NgZone,
    private readonly _changeDetector: ChangeDetectorRef,
  ) {
    this._nativeElement = toNativeElement(this.$element);
  }

  public open(context?: any): void {
    if (!this._opening && this._transitioning && this._windowRef) {
      this._transitioning = false;
      ngbCompleteTransition(this._windowRef.$element);
    }

    if (!this._windowRef && !this._isDisabled()) {
      const templateContext = context ?? this.popoverContext;
      const { windowRef, transition$ } = this._popupService.open(
        this.ngbPopover as string | TemplateRef<any>,
        templateContext,
        this.animation,
      );
      this._opening = true;
      this._transitioning = true;
      this._windowRef = windowRef;

      windowRef.setInput("animation", this.animation);
      windowRef.setInput("title", this.popoverTitle);
      windowRef.setInput("context", templateContext);
      windowRef.setInput("popoverClass", this.popoverClass);
      windowRef.setInput("id", this._ngbPopoverWindowId);
      windowRef.setInput("onMouseEnter", () => this._mouseEnterPopover.next());
      windowRef.setInput("onMouseLeave", () => this._mouseLeavePopover.next());

      this._getPositionTargetElement().setAttribute("aria-describedby", this._ngbPopoverWindowId);

      const popupElement = toNativeElement(windowRef.$element);
      if (this.container === "body") {
        document.body.appendChild(popupElement);
      } else {
        this._nativeElement.parentNode?.insertBefore(popupElement, this._nativeElement.nextSibling);
      }

      windowRef.$scope?.$evalAsync();
      this._changeDetector.markForCheck();

      this._ngZone.runOutsideAngular(() => {
        this._positioning.createPopper({
          hostElement: this._getPositionTargetElement(),
          targetElement: popupElement,
          placement: this.placement,
          baseClass: "bs-popover",
          updatePopperOptions: (options) => this.popperOptions(addPopperOffset([0, 8])(options)),
        });

        Promise.resolve().then(() => this._positioning.update());
        this._afterRenderRef = this.$scope.$watch(() => this._positioning.update());
      });

      ngbAutoClose(this._ngZone, this.autoClose, this._hidden$, () => this.close(), [popupElement]);

      transition$.subscribe(() => {
        if (this._transitioning) {
          this._transitioning = false;
          this.shown?.();
        }
      });
    }
  }

  public close(animation = this.animation): void {
    if (this._opening && this._transitioning && this._windowRef) {
      this._transitioning = false;
      ngbCompleteTransition(this._windowRef.$element);
    }

    const windowRef = this._windowRef;
    if (windowRef) {
      this._getPositionTargetElement().removeAttribute("aria-describedby");
      this._opening = false;
      this._transitioning = true;
      this._popupService.close(animation).subscribe(() => {
        windowRef.$element.remove();
        this._windowRef = null;
        this._positioning.destroy();
        this._afterRenderRef?.();
        this._afterRenderRef = undefined;
        if (this._transitioning) {
          this._transitioning = false;
          this._hidden$.next();
          this.hidden?.();
        }
        this._changeDetector.markForCheck();
      });
    }
  }

  public toggle(): void {
    if (this._windowRef) {
      this.close();
    } else {
      this.open();
    }
  }

  public isOpen(): boolean {
    return this._windowRef != null;
  }

  $onInit(): void {
    this._popupService = this._popupFactory.$create<NgbPopoverWindow>(NgbPopoverWindow.$name);
    this._positioning = ngbPositioning(this._rtl);

    this.animation = this.animation ?? this._config.animation;
    this.autoClose = this.autoClose ?? this._config.autoClose;
    this.placement = this.placement ?? this._config.placement;
    this.popperOptions = this.popperOptions ?? this._config.popperOptions;
    this.triggers = this.triggers ?? this._config.triggers;
    this.container = this.container ?? this._config.container;
    this.disablePopover = this.disablePopover ?? this._config.disablePopover;
    this.popoverClass = this.popoverClass ?? this._config.popoverClass;
    this.openDelay = this.openDelay ?? this._config.openDelay;
    this.closeDelay = this.closeDelay ?? this._config.closeDelay;

    this._unregisterListenersFn = listenToTriggers(
      this.$timeout,
      this._nativeElement,
      this.triggers,
      this.isOpen.bind(this),
      this.open.bind(this),
      this.close.bind(this),
      +this.openDelay,
      +this.closeDelay,
      this._mouseEnterPopover,
      this._mouseLeavePopover,
    );
  }

  $onChanges(changes: IOnChangesObject): void {
    const { ngbPopover, popoverTitle, disablePopover, popoverClass } = changes;

    if (popoverClass && this.isOpen()) {
      this._windowRef?.setInput("popoverClass", popoverClass.currentValue);
    }

    if ((ngbPopover || popoverTitle || disablePopover) && this._isDisabled()) {
      this.close();
    }
  }

  $onDestroy(): void {
    this.close(false);
    this._unregisterListenersFn?.();
  }

  private _isDisabled(): boolean {
    return this.disablePopover ? true : !this.ngbPopover && !this.popoverTitle;
  }

  private _getPositionTargetElement(): HTMLElement {
    return (
      (typeof this.positionTarget === "string"
        ? document.querySelector<HTMLElement>(this.positionTarget)
        : this.positionTarget) || this._nativeElement
    );
  }

  static get $inject() {
    return [
      NgbPopoverConfig.$name,
      "$element",
      PopupFactory.$name,
      NgbRTL.$name,
      "$timeout",
      "$scope",
      NgZone.$name,
      ChangeDetectorRef.$name,
    ];
  }

  static get $factory(): () => IDirective {
    return () => ({
      bindToController: {
        animation: "<?",
        autoClose: "<?",
        ngbPopover: "<?",
        popoverTitle: "<?",
        placement: "<?",
        popperOptions: "<?",
        triggers: "<?",
        positionTarget: "<?",
        container: "<?",
        disablePopover: "<?",
        popoverClass: "@?",
        popoverContext: "<?",
        openDelay: "<?",
        closeDelay: "<?",
        shown: "&?",
        hidden: "&?",
      },
      controller: NgbPopover,
      restrict: "A",
      scope: true,
    });
  }

  static get $name() {
    return "ngbPopover";
  }
}
