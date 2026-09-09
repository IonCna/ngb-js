import { NgbDateAdapter } from "@ngb/datepicker/adapters/ngb-date-adapter.ts";
import { NgbCalendar } from "@ngb/datepicker/ngb-calendar.service.ts";
import { NgbDate } from "@ngb/datepicker/ngb-date.ts";
import { NgbDateParserFormatter } from "@ngb/datepicker/ngb-date-parser-formatter.ts";
import type { NgbDatepickerNavigateEvent, NgbDateStruct } from "@ngb/datepicker/ngb-date-struct.ts";
import { NgbDatepicker } from "@ngb/datepicker/ngb-datepicker.component.ts";
import { NgbDatepickerConfig } from "@ngb/datepicker/ngb-datepicker-config.service.ts";
import type { ContentTemplateContext } from "@ngb/datepicker/ngb-datepicker-content-template-context.ts";
import type { DayTemplateContext } from "@ngb/datepicker/ngb-datepicker-day-template-context.ts";
import { NgbInputDatepickerConfig } from "@ngb/datepicker/ngb-input-datepicker-config.service.ts";
import { addPopperOffset, isString, ngbAutoClose, ngbFocusTrap, ngbPositioning } from "@ngb/utils";
import type { INgModelController } from "angular";
import {
  type AfterViewInit,
  type AfterRenderRef,
  afterEveryRender,
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
  Output,
  type SimpleChanges,
  type TemplateRef,
  ViewContainerRef,
} from "ngjs-core";
import { Subject } from "rxjs";

/**
 * A directive that allows to stick a datepicker popup to an input field.
 *
 * Manages interaction with the input field itself, does value formatting and provides forms integration.
 *
 * ngjs-core:
 * - `NG_VALIDATORS` no existe → el `validate()` se cablea a mano contra el
 *   `ngModelController` (`require: ?ngModel`). Ver CORE_GAPS.
 * - `ViewContainerRef.createComponent()` es async → `open()` es `async`.
 * - `host` → `@HostListener` / `@HostBinding`.
 */
@Directive({
  selector: "input[ngbDatepicker]",
  exportAs: "ngbDatepicker",
  require: { _ngModelCtrl: "?ngModel" },
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NgbInputDatepicker), multi: true },
    // upstream también: { provide: NG_VALIDATORS, useExisting: forwardRef(() => NgbInputDatepicker), multi: true }
    // (no existe en ngjs-core — el validate() se engancha al ngModel en ngAfterViewInit).
    { provide: NgbDatepickerConfig, useExisting: NgbInputDatepickerConfig },
  ],
})
export class NgbInputDatepicker implements OnChanges, OnDestroy, AfterViewInit, ControlValueAccessor {
  static ngAcceptInputType_autoClose: boolean | string;
  static ngAcceptInputType_disabled: boolean | "";
  static ngAcceptInputType_navigation: string;
  static ngAcceptInputType_outsideDays: string;
  static ngAcceptInputType_weekdays: boolean | string;

  private _parserFormatter = inject(NgbDateParserFormatter);
  private _elRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private _vcRef = inject(ViewContainerRef);
  private _ngZone = inject(NgZone);
  private _calendar = inject(NgbCalendar);
  private _dateAdapter = inject<NgbDateAdapter<any>>(NgbDateAdapter);
  private _document = inject(DOCUMENT);
  private _changeDetector = inject(ChangeDetectorRef);
  private _injector = inject(Injector);
  private _config = inject(NgbInputDatepickerConfig);

  private _ngModelCtrl?: INgModelController;
  private _cRef: ComponentRef<NgbDatepicker> | null = null;
  private _disabled = false;
  private _elWithFocus: HTMLElement | null = null;
  private _model: NgbDate | null = null;
  private _inputValue!: string;
  private _afterRenderRef: AfterRenderRef | undefined;
  private _positioning = ngbPositioning();
  private _destroyCloseHandlers$ = new Subject<void>();

  /**
   * Indicates whether the datepicker popup should be closed automatically after date selection / outside click or not.
   *
   * @since 3.0.0
   */
  @Input() autoClose = this._config.autoClose;

  /**
   * The reference to a custom content template.
   *
   * @since 14.2.0
   */
  @Input() contentTemplate?: TemplateRef<ContentTemplateContext>;

  /**
   * An optional class applied to the datepicker popup element.
   *
   * @since 9.1.0
   */
  @Input({ binding: "@" }) datepickerClass?: string;

  /**
   * The reference to a custom template for the day.
   */
  @Input() dayTemplate?: TemplateRef<DayTemplateContext>;

  /**
   * The callback to pass any arbitrary data to the template cell via the
   * [`DayTemplateContext`](#/components/datepicker/api#DayTemplateContext)'s `data` parameter.
   *
   * @since 3.3.0
   */
  @Input() dayTemplateData?: (date: NgbDate, current?: { year: number; month: number }) => any;

  /**
   * The number of months to display.
   */
  @Input() displayMonths?: number;

  /**
   * The first day of the week.
   */
  @Input() firstDayOfWeek?: number;

  /**
   * The reference to the custom template for the datepicker footer.
   *
   * @since 3.3.0
   */
  @Input() footerTemplate?: TemplateRef<any>;

  /**
   * The callback to mark some dates as disabled.
   */
  @Input() markDisabled?: (date: NgbDate, current?: { year: number; month: number }) => boolean;

  /**
   * The earliest date that can be displayed or selected. Also used for form validation.
   */
  @Input() minDate?: NgbDateStruct;

  /**
   * The latest date that can be displayed or selected. Also used for form validation.
   */
  @Input() maxDate?: NgbDateStruct;

  /**
   * Navigation type.
   */
  @Input({ binding: "@" }) navigation?: "select" | "arrows" | "none";

  /**
   * The way of displaying days that don't belong to the current month.
   */
  @Input({ binding: "@" }) outsideDays?: "visible" | "collapsed" | "hidden";

  /**
   * The preferred placement of the datepicker popup, among the [possible values](#/guides/positioning#api).
   */
  @Input() placement = this._config.placement;

  /**
   * Allows to change default Popper options when positioning the popup.
   *
   * @since 13.1.0
   */
  @Input() popperOptions = this._config.popperOptions;

  /**
   * If `true`, when closing datepicker will focus element that was focused before datepicker was opened.
   *
   * @since 5.2.0
   */
  @Input() restoreFocus!: true | string | HTMLElement;

  /**
   * If `true`, week numbers will be displayed.
   */
  @Input() showWeekNumbers?: boolean;

  /**
   * The date to open calendar with.
   */
  @Input() startDate?: { year: number; month: number; day?: number };

  /**
   * A selector specifying the element the datepicker popup should be appended to.
   */
  @Input({ binding: "@" }) container = this._config.container;

  /**
   * A css selector or html element specifying the element the datepicker popup should be positioned against.
   *
   * @since 4.2.0
   */
  @Input() positionTarget = this._config.positionTarget;

  /**
   * The way weekdays should be displayed.
   *
   * @since 9.1.0
   */
  @Input() weekdays?: Exclude<Intl.DateTimeFormatOptions["weekday"], undefined> | boolean;

  /**
   * An event emitted when user selects a date using keyboard or mouse.
   *
   * @since 1.1.1
   */
  @Output() dateSelect = new EventEmitter<NgbDate>();

  /**
   * Event emitted right after the navigation happens and displayed month changes.
   */
  @Output() navigate = new EventEmitter<NgbDatepickerNavigateEvent>();

  /**
   * An event fired after closing datepicker window.
   *
   * @since 4.2.0
   */
  @Output() closed = new EventEmitter<void>();

  // upstream: `host: { '[disabled]': 'disabled' }` + `@Input() get disabled()`.
  @HostBinding("disabled") get _hostDisabled() {
    return this._disabled;
  }

  @Input()
  get disabled() {
    return this._disabled;
  }
  set disabled(value: any) {
    this._disabled = value === "" || (value && value !== "false");

    if (this.isOpen()) {
      this._cRef!.instance.setDisabledState(this._disabled);
    }
  }

  private _onChange = (_: any) => {};
  private _onTouched = () => {};
  private _validatorChange = () => {};

  registerOnChange(fn: (value: any) => any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => any): void {
    this._onTouched = fn;
  }

  registerOnValidatorChange(fn: () => void): void {
    this._validatorChange = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  validate(c: { value: any }): Record<string, any> | null {
    const { value } = c;

    if (value != null) {
      const ngbDate = this._fromDateStruct(this._dateAdapter.fromModel(value));

      if (!ngbDate) {
        return { ngbDate: { invalid: value } };
      }

      if (this.minDate && ngbDate.before(NgbDate.from(this.minDate))) {
        return { ngbDate: { minDate: { minDate: this.minDate, actual: value } } };
      }

      if (this.maxDate && ngbDate.after(NgbDate.from(this.maxDate))) {
        return { ngbDate: { maxDate: { maxDate: this.maxDate, actual: value } } };
      }
    }

    return null;
  }

  writeValue(value: any) {
    this._model = this._fromDateStruct(this._dateAdapter.fromModel(value));
    this._writeModelValue(this._model);
  }

  // upstream: `host: { '(input)': 'manualDateChange($any($event).target.value)',
  //   '(change)': 'manualDateChange($any($event).target.value, true)' }`.
  // ngjs-core `@HostListener` no evalúa expresiones de argumento (siempre pasa el
  // `event`), así que se extrae el value acá. Ver CORE_GAPS.
  @HostListener("input", ["$event"])
  _handleInput(event: Event) {
    this.manualDateChange((event.target as HTMLInputElement).value);
  }

  @HostListener("change", ["$event"])
  _handleChange(event: Event) {
    this.manualDateChange((event.target as HTMLInputElement).value, true);
  }

  manualDateChange(value: string, updateView = false) {
    const inputValueChanged = value !== this._inputValue;
    if (inputValueChanged) {
      this._inputValue = value;
      this._model = this._fromDateStruct(this._parserFormatter.parse(value));
    }
    if (inputValueChanged || !updateView) {
      this._onChange(this._model ? this._dateAdapter.toModel(this._model) : value === "" ? null : value);
    }
    if (updateView && this._model) {
      this._writeModelValue(this._model);
    }
  }

  isOpen() {
    return !!this._cRef;
  }

  /**
   * Opens the datepicker popup.
   *
   * ngjs-core: `createComponent` es async → método `async`.
   */
  async open() {
    if (!this.isOpen()) {
      this._cRef = await this._vcRef.createComponent(NgbDatepicker, { injector: this._injector });

      this._applyPopupStyling(this._cRef.location.nativeElement);
      this._applyDatepickerInputs(this._cRef);
      this._subscribeForDatepickerOutputs(this._cRef.instance);
      this._cRef.instance.ngOnInit();
      this._cRef.instance.writeValue(this._dateAdapter.toModel(this._model));

      // date selection event handling
      this._cRef.instance.registerOnChange((selectedDate) => {
        this.writeValue(selectedDate);
        this._onChange(selectedDate);
        this._onTouched();
      });

      this._cRef.changeDetectorRef.detectChanges();

      this._cRef.instance.setDisabledState(this.disabled);

      if (this.container === "body") {
        this._document.querySelector(this.container)?.appendChild(this._cRef.location.nativeElement);
      }

      // focus handling
      this._elWithFocus = this._document.activeElement as HTMLElement | null;
      ngbFocusTrap(this._ngZone, this._cRef.location.nativeElement, this.closed, true);
      setTimeout(() => this._cRef?.instance.focus());

      let hostElement: HTMLElement | null;
      if (isString(this.positionTarget)) {
        hostElement = this._document.querySelector(this.positionTarget);
      } else if (this.positionTarget instanceof HTMLElement) {
        hostElement = this.positionTarget;
      } else {
        hostElement = this._elRef.nativeElement;
      }

      if (this.positionTarget && !hostElement) {
        throw new Error("ngbDatepicker could not find element declared in [positionTarget] to position against.");
      }

      // Setting up popper and scheduling updates when zone is stable
      this._ngZone.runOutsideAngular(() => {
        if (this._cRef && hostElement) {
          this._positioning.createPopper({
            hostElement,
            targetElement: this._cRef.location.nativeElement,
            placement: this.placement,
            updatePopperOptions: (options: any) => this.popperOptions(addPopperOffset([0, 2])(options)),
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

      this._setCloseHandlers();
    }
  }

  /**
   * Closes the datepicker popup.
   */
  close() {
    if (this.isOpen()) {
      this._cRef?.destroy();
      this._cRef = null;
      this._positioning.destroy();
      this._afterRenderRef?.destroy();
      this._destroyCloseHandlers$.next();
      this.closed.emit();
      this._changeDetector.markForCheck();

      // restore focus
      let elementToFocus: HTMLElement | null = this._elWithFocus;
      if (isString(this.restoreFocus)) {
        elementToFocus = this._document.querySelector(this.restoreFocus);
      } else if (this.restoreFocus !== undefined) {
        elementToFocus = this.restoreFocus as HTMLElement;
      }

      // in IE document.activeElement can contain an object without 'focus()' sometimes
      if (elementToFocus && elementToFocus["focus"]) {
        elementToFocus.focus();
      } else {
        this._document.body.focus();
      }
    }
  }

  /**
   * Toggles the datepicker popup.
   */
  toggle() {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Navigates to the provided date.
   */
  navigateTo(date?: { year: number; month: number; day?: number }) {
    if (this.isOpen()) {
      this._cRef!.instance.navigateTo(date);
    }
  }

  onBlur() {
    this._onTouched();
  }

  onFocus() {
    this._elWithFocus = this._elRef.nativeElement;
  }

  ngAfterViewInit() {
    // ngjs-core: sin `NG_VALIDATORS`, el `validate()` se engancha al `ngModel`.
    if (this._ngModelCtrl) {
      this._ngModelCtrl.$validators.ngbDate = (modelValue: unknown) => this.validate({ value: modelValue }) === null;
      this.registerOnValidatorChange(() => this._ngModelCtrl?.$validate());
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["minDate"] || changes["maxDate"]) {
      this._validatorChange();

      if (this.isOpen()) {
        if (changes["minDate"]) {
          this._cRef!.setInput("minDate", this.minDate);
        }
        if (changes["maxDate"]) {
          this._cRef!.setInput("maxDate", this.maxDate);
        }
      }
    }

    if (changes["datepickerClass"]) {
      const { currentValue, previousValue } = changes["datepickerClass"];
      this._applyPopupClass(currentValue as string, previousValue as string);
    }

    if (changes["autoClose"] && this.isOpen()) {
      this._setCloseHandlers();
    }
  }

  ngOnDestroy() {
    this.close();
  }

  private _applyDatepickerInputs(datepickerComponentRef: ComponentRef<NgbDatepicker>): void {
    [
      "contentTemplate",
      "dayTemplate",
      "dayTemplateData",
      "displayMonths",
      "firstDayOfWeek",
      "footerTemplate",
      "markDisabled",
      "minDate",
      "maxDate",
      "navigation",
      "outsideDays",
      "showNavigation",
      "showWeekNumbers",
      "weekdays",
    ].forEach((inputName: string) => {
      if ((this as any)[inputName] !== undefined) {
        datepickerComponentRef.setInput(inputName, (this as any)[inputName]);
      }
    });
    datepickerComponentRef.setInput("startDate", this.startDate || this._model);
  }

  private _applyPopupClass(newClass: string, oldClass?: string) {
    const popupEl = this._cRef?.location.nativeElement as HTMLElement;
    if (popupEl) {
      if (newClass) {
        popupEl.classList.add(newClass);
      }
      if (oldClass) {
        popupEl.classList.remove(oldClass);
      }
    }
  }

  private _applyPopupStyling(nativeElement: HTMLElement) {
    nativeElement.classList.add("dropdown-menu", "show");

    if (this.container === "body") {
      nativeElement.classList.add("ngb-dp-body");
    }

    this._applyPopupClass(this.datepickerClass as string);
  }

  private _subscribeForDatepickerOutputs(datepickerInstance: NgbDatepicker) {
    datepickerInstance.navigate.subscribe((navigateEvent) => this.navigate.emit(navigateEvent));
    datepickerInstance.dateSelect.subscribe((date) => {
      this.dateSelect.emit(date);
      if (this.autoClose === true || this.autoClose === "inside") {
        this.close();
      }
    });
  }

  private _writeModelValue(model: NgbDate | null) {
    const value = this._parserFormatter.format(model);
    this._inputValue = value;
    this._elRef.nativeElement.value = value;
    if (this.isOpen()) {
      this._cRef!.instance.writeValue(this._dateAdapter.toModel(model));
      this._onTouched();
    }
  }

  private _fromDateStruct(date: NgbDateStruct | null): NgbDate | null {
    const ngbDate = date ? new NgbDate(date.year, date.month, date.day) : null;
    return this._calendar.isValid(ngbDate) ? ngbDate : null;
  }

  private _setCloseHandlers() {
    this._destroyCloseHandlers$.next();
    ngbAutoClose(
      this._ngZone,
      this._document,
      this.autoClose,
      () => this.close(),
      this._destroyCloseHandlers$,
      [],
      [this._elRef.nativeElement, this._cRef!.location.nativeElement],
    );
  }
}
