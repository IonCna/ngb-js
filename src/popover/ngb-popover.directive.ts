import { NgbPopoverConfig } from "@ngb/popover/ngb-popover-config.service";
import { NgbPopoverWindow } from "@ngb/popover/ngb-popover-window.component";
import { isString, ngbCompleteTransition } from "@ngb/utils";
import { ngbAutoClose } from "@ngb/utils/autoclose";
import { PopupService } from "@ngb/utils/popup.service";
import { ngbPositioning } from "@ngb/utils/positioning";
import { addPopperOffset } from "@ngb/utils/positioning.util";
import { listenToTriggers } from "@ngb/utils/triggers";
import type { Options } from "@popperjs/core";
import {
  type AfterRenderRef,
  afterEveryRender,
  ChangeDetectorRef,
  type ComponentRef,
  DestroyRef,
  Directive,
  DOCUMENT,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  inject,
  NgZone,
  type OnChanges,
  type OnInit,
  Output,
  type SimpleChanges,
  type TemplateRef,
} from "ngjs-core";
import { Subject } from "rxjs";

let nextId = 0;

/**
 * A lightweight and extensible directive for fancy popover creation.
 */
@Directive({ selector: "[ngbPopover]", exportAs: "ngbPopover" })
export class NgbPopover implements OnInit, OnChanges {
  static ngAcceptInputType_autoClose: boolean | string;

  private _config = inject(NgbPopoverConfig);

  /**
   * If `true`, popover opening and closing will be animated.
   */
  @Input() animation = this._config.animation;

  /**
   * Indicates whether the popover should be closed on `Escape` key and inside/outside clicks:
   *
   * * `true` - closes on both outside and inside clicks as well as `Escape` presses
   * * `false` - disables the autoClose feature (NB: triggers still apply)
   * * `"inside"` - closes on inside clicks as well as `Escape` presses
   * * `"outside"` - closes on outside clicks (sometimes also achievable through triggers)
   * as well as `Escape` presses
   */
  @Input() autoClose = this._config.autoClose;

  /**
   * The string content or a `TemplateRef` for the content to be displayed in the popover.
   *
   * If the title and the content are falsy, the popover won't open.
   */
  @Input() ngbPopover?: string | TemplateRef<any> | null;

  /**
   * The title of the popover.
   *
   * If the title and the content are falsy, the popover won't open.
   */
  @Input() popoverTitle?: string | TemplateRef<any> | null;

  /**
   * The preferred placement of the popover, among the possible values.
   *
   * The default order of preference is `"auto"`.
   */
  @Input() placement = this._config.placement;

  /**
   * Allows to change default Popper options when positioning the popover.
   * Receives current popper options and returns modified ones.
   */
  @Input() popperOptions = this._config.popperOptions;

  /**
   * Specifies events that should trigger the popover.
   *
   * Supports a space separated list of event names.
   */
  @Input() triggers = this._config.triggers;

  /**
   * A css selector or html element specifying the element the popover should be positioned against.
   * By default, the element `ngbPopover` directive is applied to will be set as a target.
   */
  @Input() positionTarget?: string | HTMLElement;

  /**
   * A selector specifying the element the popover should be appended to.
   *
   * Currently only supports `body`.
   */
  @Input() container = this._config.container;

  /**
   * If `true`, popover is disabled and won't be displayed.
   */
  @Input() disablePopover = this._config.disablePopover;

  /**
   * An optional class applied to the popover window element.
   */
  @Input({ binding: "@" }) popoverClass = this._config.popoverClass;

  /**
   * Default template context for `TemplateRef`, can be overridden with the `open` method.
   */
  @Input() popoverContext: any;

  /**
   * The opening delay in ms. Works only for "non-manual" opening triggers defined by the `triggers` input.
   */
  @Input() openDelay = this._config.openDelay;

  /**
   * The closing delay in ms. Works only for "non-manual" opening triggers defined by the `triggers` input.
   */
  @Input() closeDelay = this._config.closeDelay;

  /**
   * An event emitted when the popover opening animation has finished. Contains no payload.
   */
  @Output() shown = new EventEmitter<void>();

  /**
   * An event emitted when the popover closing animation has finished. Contains no payload.
   *
   * At this point popover is not in the DOM anymore.
   */
  @Output() hidden = new EventEmitter<void>();

  private _nativeElement = inject(ElementRef).nativeElement as HTMLElement;
  private _ngZone = inject(NgZone);
  private _document = inject(DOCUMENT);
  private _changeDetector = inject(ChangeDetectorRef);
  private _injector = inject(Injector);
  private _destroyRef = inject(DestroyRef);

  private _ngbPopoverWindowId = `ngb-popover-${nextId++}`;
  private _popupService = new PopupService(NgbPopoverWindow);
  private _windowRef: ComponentRef<NgbPopoverWindow> | null = null;
  private _unregisterListenersFn?: () => void;
  private _positioning = ngbPositioning();
  private _afterRenderRef: AfterRenderRef | undefined;

  private _mouseEnterPopover = new Subject<void>();
  private _mouseLeavePopover = new Subject<void>();

  private _opening = true;
  private _transitioning = false;

  /**
   * Opens the popover.
   *
   * This is considered to be a "manual" triggering.
   * The `context` is an optional value to be injected into the popover template when it is created.
   */
  async open(context?: any): Promise<void> {
    if (!this._opening && this._transitioning) {
      this._transitioning = false;
      ngbCompleteTransition(this._windowRef!.location.nativeElement);
    }
    if (!this._windowRef && !this._isDisabled()) {
      const templateContext = context ?? this.popoverContext;
      const { windowRef, transition$ } = await this._popupService.open(
        this.ngbPopover as string | TemplateRef<any>,
        templateContext,
        this.animation,
      );
      this._opening = true;
      this._transitioning = true;
      this._windowRef = windowRef;
      this._windowRef.setInput("animation", this.animation);
      this._windowRef.setInput("title", this.popoverTitle);
      this._windowRef.setInput("context", templateContext);
      this._windowRef.setInput("popoverClass", this.popoverClass);
      this._windowRef.setInput("id", this._ngbPopoverWindowId);
      this._windowRef.setInput("onMouseEnter", () => this._mouseEnterPopover.next());
      this._windowRef.setInput("onMouseLeave", () => this._mouseLeavePopover.next());

      this._getPositionTargetElement().setAttribute("aria-describedby", this._ngbPopoverWindowId);

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
          baseClass: "bs-popover",
          updatePopperOptions: (options: Partial<Options>) => this.popperOptions(addPopperOffset([0, 8])(options)),
        });

        Promise.resolve().then(() => {
          this._positioning.update();
        });
        this._afterRenderRef = afterEveryRender(
          {
            write: () => {
              this._ngZone.runOutsideAngular(() => this._positioning.update());
            },
          },
          { injector: this._injector },
        );
      });

      ngbAutoClose(this._ngZone, this._document, this.autoClose, () => this.close(), this.hidden, [
        this._windowRef.location.nativeElement,
      ]);

      transition$.subscribe(() => {
        if (this._transitioning) {
          this._transitioning = false;
          this.shown.emit();
        }
      });
    }
  }

  /**
   * Closes the popover.
   *
   * This is considered to be a "manual" triggering of the popover.
   */
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

  /**
   * Toggles the popover.
   *
   * This is considered to be a "manual" triggering of the popover.
   */
  toggle(): void {
    if (this._windowRef) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Returns `true`, if the popover is currently shown.
   */
  isOpen(): boolean {
    return this._windowRef != null;
  }

  ngOnInit(): void {
    // Teardown goes through `DestroyRef` instead of `ngOnDestroy`: this directive
    // also declares `@Output`s, and the output-emitter bridge installs its own
    // `$onDestroy` first, which currently makes the lifecycle bridge skip the
    // `ngOnDestroy` -> `$onDestroy` alias. `DestroyRef` is chained, so it fires.
    this._destroyRef.onDestroy(() => {
      this.close(false);
      this._unregisterListenersFn?.();
    });

    this._unregisterListenersFn = listenToTriggers(
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

  ngOnChanges({ ngbPopover, popoverTitle, disablePopover, popoverClass }: SimpleChanges): void {
    if (popoverClass && this.isOpen()) {
      this._windowRef!.setInput("popoverClass", popoverClass.currentValue);
    }
    // close popover if title and content become empty, or disablePopover set to true
    if ((ngbPopover || popoverTitle || disablePopover) && this._isDisabled()) {
      this.close();
    }
  }

  private _isDisabled(): boolean {
    return this.disablePopover ? true : !this.ngbPopover && !this.popoverTitle;
  }

  private _getPositionTargetElement(): HTMLElement {
    return (
      (isString(this.positionTarget) ? this._document.querySelector(this.positionTarget) : this.positionTarget) ||
      this._nativeElement
    );
  }
}
