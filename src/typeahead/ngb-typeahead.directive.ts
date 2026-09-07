import { NgbTypeaheadConfig } from "@ngb/typeahead/ngb-typeahead-config.service";
import { type ResultTemplateContext, NgbTypeaheadWindow } from "@ngb/typeahead/ngb-typeahead-window";
import { addPopperOffset, isDefined, Live, ngbAutoClose, ngbPositioning, PopupService, toString } from "@ngb/utils";
import {
  afterEveryRender,
  type AfterRenderRef,
  ChangeDetectorRef,
  type ComponentRef,
  type ControlValueAccessor,
  Directive,
  DOCUMENT,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostBinding,
  HostListener,
  inject,
  Injector,
  Input,
  NG_VALUE_ACCESSOR,
  NgZone,
  type OnChanges,
  type OnDestroy,
  type OnInit,
  Output,
  type SimpleChanges,
  type TemplateRef,
} from "ngjs-core";
import {
  BehaviorSubject,
  fromEvent,
  map,
  type OperatorFunction,
  of,
  Subject,
  type Subscription,
  switchMap,
  tap,
} from "rxjs";

export interface NgbTypeaheadSelectItemEvent<T = any> {
  item: T;
  preventDefault: () => void;
}

let nextWindowId = 0;

@Directive({
  selector: "input[ngbTypeahead]",
  exportAs: "ngbTypeahead",
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NgbTypeahead), multi: true }],
})
export class NgbTypeahead implements ControlValueAccessor, OnInit, OnChanges, OnDestroy {
  private _nativeElement = inject(ElementRef).nativeElement as HTMLInputElement;
  private _config = inject(NgbTypeaheadConfig);
  private _live = inject(Live);
  private _document = inject(DOCUMENT);
  private _ngZone = inject(NgZone);
  private _changeDetector = inject(ChangeDetectorRef);
  private _injector = inject(Injector);

  private _popupService = new PopupService(NgbTypeaheadWindow);
  private _positioning = ngbPositioning();

  private _subscription: Subscription | null = null;
  private _closed$ = new Subject<void>();
  private _inputValueBackup: string | null = null;
  private _inputValueForSelectOnExact: string | null = null;
  private _valueChanges$ = fromEvent<Event>(this._nativeElement, "input").pipe(
    map(($event) => ($event.target as HTMLInputElement).value),
  );
  private _resubscribeTypeahead$ = new BehaviorSubject(null);
  private _windowRef: ComponentRef<NgbTypeaheadWindow> | null = null;
  private _afterRenderRef!: AfterRenderRef;

  @Input() @HostBinding("autocomplete") autocomplete = "off";
  @Input() container = this._config.container;
  @Input() editable = this._config.editable;
  @Input() focusFirst = this._config.focusFirst;
  @Input() inputFormatter!: (item: any) => string;
  @Input() ngbTypeahead: OperatorFunction<string, readonly any[]> | null | undefined;
  @Input() resultFormatter!: (item: any) => string;
  @Input() resultTemplate!: TemplateRef<ResultTemplateContext>;
  @Input() selectOnExact = this._config.selectOnExact;
  @Input() showHint = this._config.showHint;
  @Input() placement = this._config.placement;
  @Input() popperOptions = this._config.popperOptions;
  @Input() popupClass!: string;

  @Output() selectItem = new EventEmitter<NgbTypeaheadSelectItemEvent>();

  @HostBinding("attr.role") readonly role = "combobox";
  @HostBinding("attr.autocapitalize") readonly autocapitalize = "off";
  @HostBinding("attr.autocorrect") readonly autocorrect = "off";

  @HostBinding("attr.aria-activedescendant") activeDescendant: string | null = null;
  popupId = `ngb-typeahead-${nextWindowId++}`;

  @HostBinding("class.open")
  get isOpenClass() {
    return this.isPopupOpen();
  }

  @HostBinding("attr.aria-autocomplete")
  get ariaAutocomplete() {
    return this.showHint ? "both" : "list";
  }

  @HostBinding("attr.aria-controls")
  get ariaControls() {
    return this.isPopupOpen() ? this.popupId : null;
  }

  @HostBinding("attr.aria-expanded")
  get ariaExpanded() {
    return this.isPopupOpen();
  }

  private _onTouched = () => {};
  private _onChange = (_: any) => {};

  ngOnInit(): void {
    this._subscribeToUserInput();
  }

  ngOnChanges({ ngbTypeahead }: SimpleChanges): void {
    if (ngbTypeahead && !ngbTypeahead.firstChange) {
      this._unsubscribeFromUserInput();
      this._subscribeToUserInput();
    }
  }

  ngOnDestroy(): void {
    this._closePopup();
    this._unsubscribeFromUserInput();
  }

  registerOnChange(fn: (value: any) => any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => any): void {
    this._onTouched = fn;
  }

  writeValue(value: any) {
    this._writeInputValue(this._formatItemForInput(value));
    if (this.showHint) {
      this._inputValueBackup = value;
    }
  }

  setDisabledState(isDisabled: boolean): void {
    this._nativeElement.disabled = isDisabled;
  }

  dismissPopup() {
    if (this.isPopupOpen()) {
      this._resubscribeTypeahead$.next(null);
      this._closePopup();
      if (this.showHint && this._inputValueBackup !== null) {
        this._writeInputValue(this._inputValueBackup);
      }
      this._changeDetector.markForCheck();
    }
  }

  isPopupOpen() {
    return this._windowRef != null;
  }

  @HostListener("blur")
  handleBlur() {
    this._resubscribeTypeahead$.next(null);
    this._onTouched();
  }

  @HostListener("keydown", ["$event"])
  handleKeyDown(event: KeyboardEvent) {
    if (!this.isPopupOpen()) {
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        this._windowRef!.instance.next();
        this._showHint();
        break;
      case "ArrowUp":
        event.preventDefault();
        this._windowRef!.instance.prev();
        this._showHint();
        break;
      case "Enter":
      case "Tab": {
        const result = this._windowRef!.instance.getActive();
        if (isDefined(result)) {
          event.preventDefault();
          event.stopPropagation();
          this._selectResult(result);
        }
        this._closePopup();
        break;
      }
    }
  }

  private async _openPopup(): Promise<void> {
    if (!this.isPopupOpen()) {
      this._inputValueBackup = this._nativeElement.value;
      const { windowRef } = await this._popupService.open();
      this._windowRef = windowRef;
      this._windowRef.setInput("id", this.popupId);
      this._windowRef.setInput("popupClass", this.popupClass);
      this._windowRef.instance.selectEvent.subscribe((result: any) => this._selectResultClosePopup(result));
      this._windowRef.instance.activeChangeEvent.subscribe((activeId: string) => (this.activeDescendant = activeId));

      if (this.container === "body") {
        (this._windowRef.location.nativeElement as HTMLElement).style.zIndex = "1055";
        this._document.body.appendChild(this._windowRef.location.nativeElement);
      }

      this._changeDetector.markForCheck();

      this._ngZone.runOutsideAngular(() => {
        if (this._windowRef) {
          this._positioning.createPopper({
            hostElement: this._nativeElement,
            targetElement: this._windowRef.location.nativeElement,
            placement: this.placement,
            updatePopperOptions: (options) => this.popperOptions(addPopperOffset([0, 2])(options)),
          });

          this._afterRenderRef = afterEveryRender(
            {
              mixedReadWrite: () => {
                this._positioning.update();
              },
            },
            { injector: this._injector },
          );
        }
      });

      ngbAutoClose(this._ngZone, this._document, "outside", () => this.dismissPopup(), this._closed$, [
        this._nativeElement,
        this._windowRef.location.nativeElement,
      ]);
    }
  }

  private _closePopup() {
    this._popupService.close().subscribe(() => {
      this._positioning.destroy();
      this._afterRenderRef?.destroy();
      this._closed$.next();
      this._windowRef = null;
      this.activeDescendant = null;
    });
  }

  private _selectResult(result: any) {
    let defaultPrevented = false;
    this.selectItem.emit({
      item: result,
      preventDefault: () => {
        defaultPrevented = true;
      },
    });
    this._resubscribeTypeahead$.next(null);

    if (!defaultPrevented) {
      this.writeValue(result);
      this._onChange(result);
    }
  }

  private _selectResultClosePopup(result: any) {
    this._selectResult(result);
    this._closePopup();
  }

  private _showHint() {
    if (this.showHint && this._windowRef?.instance.hasActive() && this._inputValueBackup != null) {
      const userInputLowerCase = this._inputValueBackup.toLowerCase();
      const formattedVal = this._formatItemForInput(this._windowRef.instance.getActive());

      if (userInputLowerCase === formattedVal.substring(0, this._inputValueBackup.length).toLowerCase()) {
        this._writeInputValue(this._inputValueBackup + formattedVal.substring(this._inputValueBackup.length));
        this._nativeElement.setSelectionRange(this._inputValueBackup.length, formattedVal.length);
      } else {
        this._writeInputValue(formattedVal);
      }
    }
  }

  private _formatItemForInput(item: any): string {
    return item != null && this.inputFormatter ? this.inputFormatter(item) : toString(item);
  }

  private _writeInputValue(value: string): void {
    this._nativeElement.value = toString(value);
  }

  private _subscribeToUserInput(): void {
    const results$ = this._valueChanges$.pipe(
      tap((value) => {
        this._inputValueBackup = this.showHint ? value : null;
        this._inputValueForSelectOnExact = this.selectOnExact ? value : null;
        this._onChange(this.editable ? value : null);
      }),
      this.ngbTypeahead ? this.ngbTypeahead : () => of([]),
    );

    this._subscription = this._resubscribeTypeahead$.pipe(switchMap(() => results$)).subscribe(async (results) => {
      if (!results || results.length === 0) {
        this._closePopup();
      } else if (
        this.selectOnExact &&
        results.length === 1 &&
        this._formatItemForInput(results[0]) === this._inputValueForSelectOnExact
      ) {
        this._selectResult(results[0]);
        this._closePopup();
      } else {
        await this._openPopup();
        this._windowRef!.setInput("focusFirst", this.focusFirst);
        this._windowRef!.setInput("results", results);
        this._windowRef!.setInput("term", this._nativeElement.value);
        if (this.resultFormatter) {
          this._windowRef!.setInput("formatter", this.resultFormatter);
        }
        if (this.resultTemplate) {
          this._windowRef!.setInput("resultTemplate", this.resultTemplate);
        }
        this._windowRef!.instance.resetActive();
        this._windowRef!.changeDetectorRef.detectChanges();
        this._showHint();
      }

      const count = results ? results.length : 0;
      this._live.say(count === 0 ? "No results available" : `${count} result${count === 1 ? "" : "s"} available`);
    });
  }

  private _unsubscribeFromUserInput() {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
    this._subscription = null;
  }
}
