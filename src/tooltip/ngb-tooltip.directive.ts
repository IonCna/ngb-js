import { NgbTooltipConfig } from "@ngb/tooltip/ngb-tooltip-config.service";
import { NgbTooltipWindow } from "@ngb/tooltip/ngb-tooltip-window.component";
import { isString, ngbCompleteTransition } from "@ngb/utils";
import { ngbAutoClose } from "@ngb/utils/autoclose";
import { PopupService } from "@ngb/utils/popup.service";
import { ngbPositioning } from "@ngb/utils/positioning";
import { addPopperOffset } from "@ngb/utils/positioning.util";
import { listenToTriggers } from "@ngb/utils/triggers";
import { Subject } from "rxjs";
import {
  afterEveryRender,
  type AfterRenderRef,
  ChangeDetectorRef,
  type ComponentRef,
  Directive,
  DOCUMENT,
  ElementRef,
  EventEmitter,
  inject,
  Injector,
  Input,
  NgZone,
  type OnChanges,
  type OnDestroy,
  type OnInit,
  Output,
  type SimpleChanges,
  type TemplateRef,
} from "ngjs-core";

let nextId = 0;

@Directive({ selector: "[ngbTooltip]", exportAs: "ngbTooltip" })
export class NgbTooltip implements OnInit, OnDestroy, OnChanges {
  static ngAcceptInputType_autoClose: boolean | string;

  private _config = inject(NgbTooltipConfig);

  @Input() animation = this._config.animation;
  @Input() autoClose = this._config.autoClose;
  @Input() placement = this._config.placement;
  @Input() popperOptions = this._config.popperOptions;
  @Input() triggers = this._config.triggers;
  @Input() positionTarget?: string | HTMLElement;
  @Input() container = this._config.container;
  @Input() disableTooltip = this._config.disableTooltip;
  @Input() tooltipClass = this._config.tooltipClass;
  @Input() tooltipContext: any;
  @Input() openDelay = this._config.openDelay;
  @Input() closeDelay = this._config.closeDelay;

  @Output() shown = new EventEmitter();
  @Output() hidden = new EventEmitter();

  private _nativeElement = inject(ElementRef).nativeElement as HTMLElement;
  private _ngZone = inject(NgZone);
  private _document = inject(DOCUMENT);
  private _changeDetector = inject(ChangeDetectorRef);
  private _injector = inject(Injector);

  private _ngbTooltip: string | TemplateRef<any> | null | undefined;
  private _ngbTooltipWindowId = `ngb-tooltip-${nextId++}`;
  private _popupService = new PopupService(NgbTooltipWindow);
  private _windowRef: ComponentRef<NgbTooltipWindow> | null = null;
  private _unregisterListenersFn?: () => void;
  private _positioning = ngbPositioning();
  private _afterRenderRef: AfterRenderRef | undefined;

  private _mouseEnterTooltip = new Subject<void>();
  private _mouseLeaveTooltip = new Subject<void>();

  private _opening = true;
  private _transitioning = false;

  @Input()
  set ngbTooltip(value: string | TemplateRef<any> | null | undefined) {
    this._ngbTooltip = value;
    if (!value && this._windowRef) {
      this.close();
    }
  }

  get ngbTooltip() {
    return this._ngbTooltip;
  }

  async open(context?: any): Promise<void> {
    if (!this._opening && this._transitioning) {
      this._transitioning = false;
      ngbCompleteTransition(this._windowRef!.location.nativeElement);
    }
    if (!this._windowRef && this._ngbTooltip && !this.disableTooltip) {
      const { windowRef, transition$ } = await this._popupService.open(
        this._ngbTooltip,
        context ?? this.tooltipContext,
        this.animation,
      );
      this._opening = true;
      this._transitioning = true;
      this._windowRef = windowRef;
      this._windowRef.setInput("animation", this.animation);
      this._windowRef.setInput("tooltipClass", this.tooltipClass);
      this._windowRef.setInput("id", this._ngbTooltipWindowId);
      this._windowRef.setInput("onMouseEnter", () => this._mouseEnterTooltip.next());
      this._windowRef.setInput("onMouseLeave", () => this._mouseLeaveTooltip.next());

      this._getPositionTargetElement().setAttribute("aria-describedby", this._ngbTooltipWindowId);

      if (this.container === "body") {
        this._document.body.appendChild(this._windowRef.location.nativeElement);
      }

      this._windowRef.changeDetectorRef.detectChanges();
      this._windowRef.changeDetectorRef.markForCheck();

      this._ngZone.runOutsideAngular(() => {
        this._positioning.createPopper({
          hostElement: this._getPositionTargetElement(),
          targetElement: this._windowRef!.location.nativeElement,
          placement: this.placement,
          baseClass: "bs-tooltip",
          updatePopperOptions: (options) => this.popperOptions(addPopperOffset([0, 6])(options)),
        });

        Promise.resolve().then(() => {
          this._positioning.update();
        });
        this._afterRenderRef = afterEveryRender(
          {
            mixedReadWrite: () => {
              this._positioning.update();
            },
          },
          { injector: this._injector },
        );
      });

      ngbAutoClose(
        this._ngZone,
        this._document,
        this.autoClose,
        () => this.close(),
        this.hidden,
        [this._windowRef.location.nativeElement],
        [this._nativeElement],
      );

      transition$.subscribe(() => {
        if (this._transitioning) {
          this._transitioning = false;
          this.shown.emit();
        }
      });
    }
  }

  close(animation = this.animation): void {
    if (this._opening && this._transitioning) {
      this._transitioning = false;
      ngbCompleteTransition(this._windowRef!.location.nativeElement);
    }
    if (this._windowRef != null) {
      this._getPositionTargetElement().removeAttribute("aria-describedby");
      this._opening = false;
      this._transitioning = true;
      this._popupService.close(animation).subscribe(() => {
        this._windowRef = null;
        this._positioning.destroy();
        this._afterRenderRef?.destroy();
        if (this._transitioning) {
          this._transitioning = false;
          this.hidden.emit();
        }
        this._changeDetector.markForCheck();
      });
    }
  }

  toggle(): void {
    if (this._windowRef) {
      this.close();
    } else {
      this.open();
    }
  }

  isOpen(): boolean {
    return this._windowRef != null;
  }

  ngOnInit() {
    this._unregisterListenersFn = listenToTriggers(
      this._nativeElement,
      this.triggers,
      this.isOpen.bind(this),
      this.open.bind(this),
      this.close.bind(this),
      +this.openDelay,
      +this.closeDelay,
      this._mouseEnterTooltip,
      this._mouseLeaveTooltip,
    );
  }

  ngOnChanges({ tooltipClass }: SimpleChanges) {
    if (tooltipClass && this.isOpen()) {
      this._windowRef!.setInput("tooltipClass", tooltipClass.currentValue);
    }
  }

  ngOnDestroy() {
    this.close(false);
    this._unregisterListenersFn?.();
  }

  private _getPositionTargetElement(): HTMLElement {
    return (
      (isString(this.positionTarget) ? this._document.querySelector(this.positionTarget) : this.positionTarget) ||
      this._nativeElement
    );
  }
}
