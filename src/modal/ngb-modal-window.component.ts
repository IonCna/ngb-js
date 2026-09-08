import { ModalDismissReasons } from "@ngb/modal/ngb-modal-dismiss-reasons";
import template from "@ngb/modal/ngb-modal-window.component.html";
import type { NgbModalUpdatableOptions } from "@ngb/modal/ngb-modal-config.service";
import {
  getFocusableBoundaryElements,
  isDefined,
  isString,
  type NgbTransitionOptions,
  ngbRunTransition,
  reflow,
} from "@ngb/utils";
import {
  afterNextRender,
  ChangeDetectorRef,
  Component,
  DOCUMENT,
  ElementRef,
  EventEmitter,
  HostBinding,
  inject,
  Injector,
  Input,
  NgZone,
  type OnDestroy,
  type OnInit,
  Output,
  ViewChild,
} from "ngjs-core";
import { fromEvent, type Observable, Subject, zip } from "rxjs";
import { filter, switchMap, take, takeUntil, tap } from "rxjs/operators";

const WINDOW_ATTRIBUTES = [
  "animation",
  "ariaLabelledBy",
  "ariaDescribedBy",
  "backdrop",
  "centered",
  "fullscreen",
  "keyboard",
  "role",
  "scrollable",
  "size",
  "windowClass",
  "modalDialogClass",
] as const;

@Component({
  selector: "ngb-modal-window",
  transclude: true,
  template,
})
export class NgbModalWindow implements OnInit, OnDestroy {
  private _document = inject(DOCUMENT);
  private _elRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private _zone = inject(NgZone);
  private _injector = inject(Injector);
  private _cdRef = inject(ChangeDetectorRef);

  private _closed$ = new Subject<void>();
  private _elWithFocus: Element | null = null;

  @ViewChild("dialog", { read: ElementRef, static: true }) private _dialogEl!: ElementRef<HTMLElement>;

  @Input() animation!: boolean;
  @Input({ binding: "@" }) ariaLabelledBy!: string;
  @Input({ binding: "@" }) ariaDescribedBy!: string;
  @Input() backdrop: boolean | string = true;
  @Input({ binding: "@" }) centered!: string;
  @Input() fullscreen!: string | boolean;
  @Input() keyboard = true;
  @Input({ binding: "@" }) role = "dialog";
  @Input({ binding: "@" }) scrollable!: string;
  @Input({ binding: "@" }) size!: string;
  @Input({ binding: "@" }) windowClass!: string;
  @Input({ binding: "@" }) modalDialogClass!: string;

  @Output("dismiss") dismissEvent = new EventEmitter();

  shown = new Subject<void>();
  hidden = new Subject<void>();

  @HostBinding("class")
  get _hostClass(): string {
    return `modal d-block${this.windowClass ? ` ${this.windowClass}` : ""}`;
  }

  @HostBinding("class.fade")
  get _fade(): boolean {
    return this.animation;
  }

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

  @HostBinding("attr.role")
  get _role() {
    return this.role;
  }

  get fullscreenClass(): string {
    return this.fullscreen === true
      ? " modal-fullscreen"
      : isString(this.fullscreen)
        ? ` modal-fullscreen-${this.fullscreen}-down`
        : "";
  }

  dismiss(reason: unknown): void {
    this.dismissEvent.emit(reason);
  }

  ngOnInit() {
    this._elWithFocus = this._document.activeElement;
    afterNextRender({ mixedReadWrite: () => this._show() }, { injector: this._injector });
  }

  ngOnDestroy() {
    this._disableEventHandling();
  }

  hide(): Observable<unknown> {
    const { nativeElement } = this._elRef;
    const context: NgbTransitionOptions<unknown> = { animation: this.animation, runningTransition: "stop" };

    const windowTransition$ = ngbRunTransition(
      this._zone,
      nativeElement,
      () => nativeElement.classList.remove("show"),
      context,
    );
    const dialogTransition$ = ngbRunTransition(this._zone, this._dialogEl.nativeElement, () => {}, context);

    const transitions$ = zip(windowTransition$, dialogTransition$);
    transitions$.subscribe(() => {
      this.hidden.next();
      this.hidden.complete();
    });

    this._disableEventHandling();
    this._restoreFocus();

    return transitions$;
  }

  updateOptions(options: NgbModalUpdatableOptions): void {
    for (const optionName of WINDOW_ATTRIBUTES) {
      if (isDefined((options as Record<string, unknown>)[optionName])) {
        (this as Record<string, unknown>)[optionName] = (options as Record<string, unknown>)[optionName];
      }
    }
    this._cdRef.markForCheck();
  }

  private _show() {
    const context: NgbTransitionOptions<unknown> = { animation: this.animation, runningTransition: "continue" };

    const windowTransition$ = ngbRunTransition(
      this._zone,
      this._elRef.nativeElement,
      (element: HTMLElement, animation: boolean) => {
        if (animation) {
          reflow(element);
        }
        element.classList.add("show");
      },
      context,
    );
    const dialogTransition$ = ngbRunTransition(this._zone, this._dialogEl.nativeElement, () => {}, context);

    zip(windowTransition$, dialogTransition$).subscribe(() => {
      this.shown.next();
      this.shown.complete();
    });

    this._enableEventHandling();
    this._setFocus();
  }

  private _enableEventHandling() {
    const { nativeElement } = this._elRef;
    this._zone.runOutsideAngular(() => {
      fromEvent<KeyboardEvent>(nativeElement, "keydown")
        .pipe(
          takeUntil(this._closed$),
          filter((e) => e.key === "Escape"),
        )
        .subscribe((event) => {
          if (this.keyboard) {
            requestAnimationFrame(() => {
              if (!event.defaultPrevented) {
                this._zone.run(() => this.dismiss(ModalDismissReasons.ESC));
              }
            });
          } else if (this.backdrop === "static") {
            this._bumpBackdrop();
          }
        });

      let preventClose = false;
      fromEvent<MouseEvent>(this._dialogEl.nativeElement, "mousedown")
        .pipe(
          takeUntil(this._closed$),
          tap(() => (preventClose = false)),
          switchMap(() => fromEvent<MouseEvent>(nativeElement, "mouseup").pipe(takeUntil(this._closed$), take(1))),
          filter(({ target }) => nativeElement === target),
        )
        .subscribe(() => {
          preventClose = true;
        });

      fromEvent<MouseEvent>(nativeElement, "click")
        .pipe(takeUntil(this._closed$))
        .subscribe(({ target }) => {
          if (nativeElement === target) {
            if (this.backdrop === "static") {
              this._bumpBackdrop();
            } else if (this.backdrop === true && !preventClose) {
              this._zone.run(() => this.dismiss(ModalDismissReasons.BACKDROP_CLICK));
            }
          }
          preventClose = false;
        });
    });
  }

  private _disableEventHandling() {
    this._closed$.next();
  }

  private _setFocus() {
    const { nativeElement } = this._elRef;
    if (!nativeElement.contains(document.activeElement)) {
      const autoFocusable = nativeElement.querySelector("[ngbAutofocus]") as HTMLElement;
      const firstFocusable = getFocusableBoundaryElements(nativeElement)[0];

      const elementToFocus = autoFocusable || firstFocusable || nativeElement;
      elementToFocus.focus();
    }
  }

  private _restoreFocus() {
    const body = this._document.body;
    const elWithFocus = this._elWithFocus;

    let elementToFocus: HTMLElement;
    if (elWithFocus instanceof HTMLElement && body.contains(elWithFocus)) {
      elementToFocus = elWithFocus;
    } else {
      elementToFocus = body;
    }
    this._zone.runOutsideAngular(() => {
      setTimeout(() => elementToFocus.focus());
      this._elWithFocus = null;
    });
  }

  private _bumpBackdrop() {
    if (this.backdrop === "static") {
      ngbRunTransition(
        this._zone,
        this._elRef.nativeElement,
        ({ classList }) => {
          classList.add("modal-static");
          return () => classList.remove("modal-static");
        },
        { animation: this.animation, runningTransition: "continue" },
      );
    }
  }

  static get $name() {
    return "ngbModalWindow";
  }
}
