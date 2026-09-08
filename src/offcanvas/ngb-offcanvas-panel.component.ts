import type { NgbOffcanvasUpdatableOptions } from "@ngb/offcanvas/ngb-offcanvas-config.service";
import { OffcanvasDismissReasons } from "@ngb/offcanvas/ngb-offcanvas-dismiss-reasons";
import {
  ngbOffcanvasPanelHideTransition,
  ngbOffcanvasPanelShowTransition,
} from "@ngb/offcanvas/ngb-offcanvas-panel-transition";
import { getFocusableBoundaryElements, isDefined, type NgbTransitionOptions, ngbRunTransition } from "@ngb/utils";
import {
  afterNextRender,
  ChangeDetectorRef,
  Component,
  DOCUMENT,
  ElementRef,
  HostBinding,
  inject,
  Injector,
  Input,
  NgZone,
  type OnDestroy,
  type OnInit,
} from "ngjs-core";
import { defaultIfEmpty, filter, fromEvent, type Observable, Subject, takeUntil } from "rxjs";

const PANEL_ATTRIBUTES = [
  "animation",
  "ariaLabelledBy",
  "ariaDescribedBy",
  "keyboard",
  "panelClass",
  "position",
] as const;

@Component({
  selector: "ngb-offcanvas-panel",
  transclude: true,
  template: "<ng-content></ng-content>",
})
export class NgbOffcanvasPanel implements OnInit, OnDestroy {
  private _nativeElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private _zone = inject(NgZone);
  private _injector = inject(Injector);
  private _cdRef = inject(ChangeDetectorRef);
  private _document = inject(DOCUMENT);

  @Input() animation?: boolean;
  @Input({ binding: "@" }) ariaLabelledBy?: string;
  @Input({ binding: "@" }) ariaDescribedBy?: string;
  @Input() keyboard = true;
  @Input({ binding: "@" }) panelClass?: string;
  @Input({ binding: "@" }) position: "start" | "end" | "top" | "bottom" = "start";

  /** Lo asigna `NgbOffcanvasRef` — descarta el offcanvas. */
  onDismiss?: (arg: { $event: unknown }) => void;

  shown = new Subject<void>();
  hidden = new Subject<void>();

  private _elWithFocus: Element | null = null;
  private _closed$ = new Subject<void>();

  @HostBinding("class")
  get _hostClass(): string {
    return `offcanvas offcanvas-${this.position}${this.panelClass ? ` ${this.panelClass}` : ""}`;
  }

  @HostBinding("attr.role") readonly _role = "dialog";
  @HostBinding("attr.tabindex") readonly _tabindex = -1;
  @HostBinding("attr.aria-modal") readonly _ariaModal = true;

  @HostBinding("attr.aria-labelledby")
  get _ariaLabelledBy() {
    return this.ariaLabelledBy;
  }

  @HostBinding("attr.aria-describedby")
  get _ariaDescribedBy() {
    return this.ariaDescribedBy;
  }

  ngOnInit(): void {
    this._elWithFocus = this._document.activeElement;
    afterNextRender({ mixedReadWrite: () => this._show() }, { injector: this._injector });
  }

  ngOnDestroy(): void {
    this._disableEventHandling();
  }

  dismiss(reason: unknown): void {
    this.onDismiss?.({ $event: reason });
  }

  updateOptions(options: NgbOffcanvasUpdatableOptions): void {
    for (const optionName of PANEL_ATTRIBUTES) {
      if (isDefined((options as Record<string, unknown>)[optionName])) {
        (this as Record<string, unknown>)[optionName] = (options as Record<string, unknown>)[optionName];
      }
    }
    this._cdRef.markForCheck();
  }

  hide(): Observable<void> {
    const context: NgbTransitionOptions<unknown> = { animation: Boolean(this.animation), runningTransition: "stop" };

    const offcanvasTransition$ = ngbRunTransition(
      this._zone,
      this._nativeElement,
      ngbOffcanvasPanelHideTransition,
      context,
    ).pipe(defaultIfEmpty(undefined));

    offcanvasTransition$.subscribe(() => {
      this.hidden.next();
      this.hidden.complete();
    });

    this._disableEventHandling();
    this._restoreFocus();

    return offcanvasTransition$ as Observable<void>;
  }

  private _show(): void {
    const context: NgbTransitionOptions<unknown> = {
      animation: Boolean(this.animation),
      runningTransition: "continue",
    };

    const offcanvasTransition$ = ngbRunTransition(
      this._zone,
      this._nativeElement,
      ngbOffcanvasPanelShowTransition,
      context,
    ).pipe(defaultIfEmpty(undefined));

    offcanvasTransition$.subscribe(() => {
      this.shown.next();
      this.shown.complete();
    });

    this._enableEventHandling();
    this._setFocus();
  }

  private _enableEventHandling(): void {
    this._zone.runOutsideAngular(() => {
      fromEvent<KeyboardEvent>(this._nativeElement, "keydown")
        .pipe(
          takeUntil(this._closed$),
          filter((event) => event.key === "Escape"),
        )
        .subscribe((event) => {
          if (this.keyboard) {
            requestAnimationFrame(() => {
              if (!event.defaultPrevented) {
                this._zone.run(() => this.dismiss(OffcanvasDismissReasons.ESC));
              }
            });
          }
        });
    });
  }

  private _disableEventHandling(): void {
    this._closed$.next();
  }

  private _setFocus(): void {
    const native = this._nativeElement;
    if (!native.contains(document.activeElement)) {
      const autoFocusable = native.querySelector("[ngbAutofocus]") as HTMLElement | null;
      const [firstFocusable] = getFocusableBoundaryElements(native);

      const elementToFocus = autoFocusable || firstFocusable || native;
      elementToFocus.focus();
    }
  }

  private _restoreFocus(): void {
    const body = this._document.body;
    const elWithFocus = this._elWithFocus;
    const validElementToFocus = elWithFocus instanceof HTMLElement && body.contains(elWithFocus);
    const elementToFocus: HTMLElement = validElementToFocus ? elWithFocus : body;

    this._zone.runOutsideAngular(() => setTimeout(() => elementToFocus.focus()));
    this._elWithFocus = null;
  }

  static get $name() {
    return "ngbOffcanvasPanel";
  }
}
