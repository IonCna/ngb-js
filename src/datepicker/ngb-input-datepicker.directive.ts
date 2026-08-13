import { type NgbDateAdapter, NgbDateStructAdapter } from "@ngb/datepicker/adapters/ngb-date-adapter.ts";
import type { NgbCalendar } from "@ngb/datepicker/ngb-calendar.service.ts";
import { NgbCalendarGregorian } from "@ngb/datepicker/ngb-calendar.service.ts";
import { NgbDate } from "@ngb/datepicker/ngb-date.ts";
import { NgbDateISOParserFormatter, type NgbDateParserFormatter } from "@ngb/datepicker/ngb-date-parser-formatter.ts";
import type { NgbDatepickerNavigateEvent, NgbDateStruct } from "@ngb/datepicker/ngb-date-struct.ts";
import { NgbDatepicker } from "@ngb/datepicker/ngb-datepicker.component.ts";
import type { ContentTemplateContext } from "@ngb/datepicker/ngb-datepicker-content-template-context.ts";
import type { DayTemplateContext } from "@ngb/datepicker/ngb-datepicker-day-template-context.ts";
import type { NgbDatepickerI18n } from "@ngb/datepicker/ngb-datepicker-i18n.service.ts";
import { NgbInputDatepickerConfig } from "@ngb/datepicker/ngb-input-datepicker-config.service.ts";
import { toNativeElement } from "@ngb/utils";
import { ngbAutoClose } from "@ngb/utils/autoclose";
import { ngbFocusTrap } from "@ngb/utils/focus-trap";
import { type ContentRef, type IPopupService, PopupFactory } from "@ngb/utils/popup.service";
import { type NgbPositioning, ngbPositioning, type PlacementArray } from "@ngb/utils/positioning";
import { addPopperOffset } from "@ngb/utils/positioning.util";
import { NgbRTL } from "@ngb/utils/rtl.service";
import type { Options } from "@popperjs/core";
import type {
  IAugmentedJQuery,
  ICompileService,
  IController,
  IDirective,
  INgModelController,
  IOnChangesObject,
  IRootScopeService,
  IScope,
} from "angular";
import { ChangeDetectorRef, type NgDisabled, NgZone, type TemplateRef } from "ngjs-core";
import { Subject } from "rxjs";

const DATEPICKER_INPUTS = [
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
  "showWeekNumbers",
  "weekdays",
] as const;

export type NgbDatepickerValidationErrors = {
  ngbDate: {
    invalid?: unknown;
    minDate?: { minDate: NgbDateStruct; actual: unknown };
    maxDate?: { maxDate: NgbDateStruct; actual: unknown };
  };
};

export class NgbInputDatepicker implements IController {
  public autoClose!: boolean | "inside" | "outside";
  public calendar?: NgbCalendar;
  public contentTemplate?: TemplateRef<ContentTemplateContext>;
  public datepickerClass?: string;
  public dateAdapter?: NgbDateAdapter<unknown>;
  public dayTemplate?: TemplateRef<DayTemplateContext>;
  public dayTemplateData?: (date: NgbDateStruct, current?: { year: number; month: number }) => unknown;
  public displayMonths?: number;
  public firstDayOfWeek?: number;
  public footerTemplate?: TemplateRef<unknown>;
  public markDisabled?: (date: NgbDateStruct, current?: { year: number; month: number }) => boolean;
  public i18n?: NgbDatepickerI18n;
  public minDate?: NgbDateStruct;
  public maxDate?: NgbDateStruct;
  public navigation?: "select" | "arrows" | "none";
  public outsideDays?: "visible" | "collapsed" | "hidden";
  public placement!: PlacementArray;
  public parserFormatter?: NgbDateParserFormatter;
  public popperOptions!: (options: Partial<Options>) => Partial<Options>;
  public restoreFocus!: true | string | HTMLElement;
  public showWeekNumbers?: boolean;
  public startDate?: { year: number; month: number; day?: number };
  public container!: null | "body";
  public positionTarget?: string | HTMLElement;
  public weekdays?: Exclude<Intl.DateTimeFormatOptions["weekday"], undefined> | boolean;
  public dateSelect?: (locals: { $event: NgbDate }) => void;
  public navigate?: (locals: { $event: NgbDatepickerNavigateEvent }) => void;
  public closed?: () => void;
  public ngDisabled?: NgDisabled;

  private ngModelCtrl?: INgModelController;
  private readonly _closed$ = new Subject<void>();
  private readonly _nativeElement: HTMLInputElement;
  private readonly _popupService: IPopupService<NgbDatepicker>;
  private readonly _positioning: NgbPositioning;
  private _windowRef: ContentRef<NgbDatepicker> | null = null;
  private _model: NgbDate | null = null;
  private _inputValue = "";
  private _disabled = false;
  private _elementWithFocus: HTMLElement | null = null;
  private _removeDisabledListener?: () => void;
  private _unwatchPositioning?: () => void;
  private _onChange: (value: unknown) => void = () => undefined;
  private _onTouched: () => void = () => undefined;
  private _validatorChange: () => void = () => undefined;

  public get disabled(): boolean {
    return this._disabled;
  }

  public set disabled(value: boolean | "" | string | undefined) {
    this._disabled =
      value === "" ||
      (value === undefined && !!this._nativeElement?.hasAttribute("disabled")) ||
      !!(value && value !== "false");
    this._nativeElement?.toggleAttribute("disabled", this._disabled);
    this._windowRef?.componentInstance?.setDisabledState(this._disabled);
  }

  constructor(
    private readonly $element: IAugmentedJQuery,
    private readonly $scope: IScope,
    private readonly _config: NgbInputDatepickerConfig,
    private readonly _ngZone: NgZone,
    private readonly _changeDetector: ChangeDetectorRef,
    $compile: ICompileService,
    $rootScope: IRootScopeService,
    rtl: NgbRTL,
  ) {
    this._nativeElement = toNativeElement<HTMLInputElement>($element);
    const popupFactory = new PopupFactory($compile, _ngZone, $rootScope);
    this._popupService = popupFactory.$create<NgbDatepicker>(NgbDatepicker.$name);
    this._positioning = ngbPositioning(rtl);
  }

  $onInit(): void {
    this.calendar = this.calendar ?? new NgbCalendarGregorian();
    this.dateAdapter = this.dateAdapter ?? new NgbDateStructAdapter();
    this.parserFormatter = this.parserFormatter ?? new NgbDateISOParserFormatter();
    this.autoClose = this.autoClose ?? this._config.autoClose;
    this.container = this.container ?? this._config.container;
    this.dayTemplate = this.dayTemplate ?? this._config.dayTemplate;
    this.dayTemplateData = this.dayTemplateData ?? this._config.dayTemplateData;
    this.displayMonths = this.displayMonths ?? this._config.displayMonths;
    this.firstDayOfWeek = this.firstDayOfWeek ?? this._config.firstDayOfWeek;
    this.footerTemplate = this.footerTemplate ?? this._config.footerTemplate;
    this.markDisabled = this.markDisabled ?? this._config.markDisabled;
    this.maxDate = this.maxDate ?? this._config.maxDate;
    this.minDate = this.minDate ?? this._config.minDate;
    this.navigation = this.navigation ?? this._config.navigation;
    this.outsideDays = this.outsideDays ?? this._config.outsideDays;
    this.placement = this.placement ?? this._config.placement;
    this.popperOptions = this.popperOptions ?? this._config.popperOptions;
    this.positionTarget = this.positionTarget ?? this._config.positionTarget;
    this.restoreFocus = this.restoreFocus ?? this._config.restoreFocus;
    this.showWeekNumbers = this.showWeekNumbers ?? this._config.showWeekNumbers;
    this.startDate = this.startDate ?? this._config.startDate;
    this.weekdays = this.weekdays ?? this._config.weekdays;

    if (this.ngModelCtrl) {
      const model = this.ngModelCtrl;
      this.registerOnChange((value) => model.$setViewValue(value));
      this.registerOnTouched(() => model.$setTouched());
      this.registerOnValidatorChange(() => model.$validate());
      model.$parsers.unshift((value: unknown) => this._parseViewValue(value));
      model.$validators.ngbDate = (modelValue: unknown) => this.validate({ value: modelValue }) === null;
      model.$render = () => this.writeValue(model.$modelValue);
      model.$render();
    }
  }

  $postLink(): void {
    this.$element.on("change", this._handleChange);
    this.$element.on("focus", this._handleFocus);
    this.$element.on("blur", this._handleBlur);
    this._removeDisabledListener = this.ngDisabled?.onChange((disabled) =>
      this.setDisabledState(disabled || this._nativeElement.disabled),
    );
    this.setDisabledState(!!this.ngDisabled?.disabled || this.disabled || this._nativeElement.disabled);
  }

  $onChanges(changes: IOnChangesObject): void {
    if (changes.minDate || changes.maxDate) this._validatorChange();

    if (changes.datepickerClass && this._windowRef) {
      const { currentValue, previousValue } = changes.datepickerClass;
      if (previousValue) this._windowRef.$element.removeClass(previousValue);
      if (currentValue) this._windowRef.$element.addClass(currentValue);
    }

    if (changes.autoClose && this.isOpen()) this._setCloseHandlers();

    if (this._windowRef) {
      for (const name of DATEPICKER_INPUTS) {
        if (name in changes) this._windowRef.setInput(name, this[name]);
      }
      if (changes.startDate) this._windowRef.componentInstance?.navigateTo(this.startDate);
    }
  }

  $onDestroy(): void {
    this.$element.off("change", this._handleChange);
    this.$element.off("focus", this._handleFocus);
    this.$element.off("blur", this._handleBlur);
    this._removeDisabledListener?.();
    this.close(false);
    this._closed$.complete();
  }

  writeValue(value: unknown): void {
    if (!this.dateAdapter) return;
    this._model = this._fromDateStruct(this.dateAdapter.fromModel(value));
    this._writeModelValue(this._model);
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  registerOnValidatorChange(fn: () => void): void {
    this._validatorChange = fn;
  }

  validate(control: { value: unknown }): NgbDatepickerValidationErrors | null {
    const value = control.value;
    if (value != null) {
      const ngbDate = this.dateAdapter ? this._fromDateStruct(this.dateAdapter.fromModel(value)) : null;
      if (!ngbDate) return { ngbDate: { invalid: value } };
      if (this.minDate && ngbDate.before(NgbDate.from(this.minDate))) {
        return { ngbDate: { minDate: { minDate: this.minDate, actual: value } } };
      }
      if (this.maxDate && ngbDate.after(NgbDate.from(this.maxDate))) {
        return { ngbDate: { maxDate: { maxDate: this.maxDate, actual: value } } };
      }
    }
    return null;
  }

  manualDateChange(value: string, updateView = false): void {
    const inputValueChanged = value !== this._inputValue;
    if (inputValueChanged) {
      this._inputValue = value;
      this._model = this._fromDateStruct(this.parserFormatter?.parse(value) ?? null);
    }
    if (inputValueChanged || !updateView) {
      this._onChange(
        this._model && this.dateAdapter ? this.dateAdapter.toModel(this._model) : value === "" ? null : value,
      );
    }
    if (updateView && this._model) this._writeModelValue(this._model);
  }

  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
    this._windowRef?.$element.toggleClass("disabled", disabled);
    if (this._windowRef) {
      this.$scope.$evalAsync(() => this._windowRef?.$element.toggleClass("disabled", this.disabled));
    }
  }

  isOpen(): boolean {
    return this._windowRef !== null;
  }

  open(): void {
    if (this.isOpen()) return;

    const { windowRef } = this._popupService.open();
    this._windowRef = windowRef;
    const instance = windowRef.componentInstance;
    if (!instance) throw new Error("Unable to create the datepicker popup component.");

    windowRef.$element.addClass("dropdown-menu show p-0");
    if (this.datepickerClass) windowRef.$element.addClass(this.datepickerClass);
    if (this.container === "body") {
      windowRef.$element.addClass("ngb-dp-body");
      windowRef.$element.css("z-index", "1055");
    }

    this._applyDatepickerInputs(windowRef);
    windowRef.setInput("dateSelect", ({ $event }: { $event: NgbDate }) => this._selectDate($event));
    windowRef.setInput("navigate", ({ $event }: { $event: NgbDatepickerNavigateEvent }) => this.navigate?.({ $event }));
    windowRef.setInput("startDate", this.startDate ?? this._model);
    instance.writeValue(this.dateAdapter?.toModel(this._model));
    instance.setDisabledState(!!this.disabled);
    windowRef.$element.toggleClass("disabled", !!this.disabled);
    this.$scope.$evalAsync(() => this._windowRef?.$element.toggleClass("disabled", this.disabled));

    const popupElement = toNativeElement(windowRef.$element);
    if (this.container === "body") document.body.appendChild(popupElement);
    else this._nativeElement.parentNode?.insertBefore(popupElement, this._nativeElement.nextSibling);

    this._elementWithFocus = document.activeElement as HTMLElement | null;
    ngbFocusTrap(this._ngZone, popupElement, this._closed$, true);
    queueMicrotask(() => instance.focus());

    const hostElement = this._resolvePositionTarget();
    this._ngZone.runOutsideAngular(() => {
      this._positioning.createPopper({
        hostElement,
        targetElement: popupElement,
        placement: this.placement,
        updatePopperOptions: (options) => this.popperOptions(addPopperOffset([0, 2])(options)),
      });
    });
    this._unwatchPositioning = this.$scope.$watch(() => this._positioning.update());
    this._setCloseHandlers();
    this._changeDetector.markForCheck();
  }

  close(restoreFocus = true): void {
    if (!this._windowRef) return;

    this._windowRef = null;
    this._closed$.next();
    this._positioning.destroy();
    this._unwatchPositioning?.();
    this._unwatchPositioning = undefined;
    this._popupService.close().subscribe(() => {
      this.closed?.();
      this._changeDetector.markForCheck();
    });

    if (restoreFocus) this._restoreFocus();
  }

  toggle(): void {
    if (this.isOpen()) this.close();
    else this.open();
  }

  navigateTo(date?: { year: number; month: number; day?: number }): void {
    this._windowRef?.componentInstance?.navigateTo(date);
  }

  private _parseViewValue(value: unknown): unknown {
    if (typeof value !== "string") return value;
    if (!this.parserFormatter || !this.dateAdapter) return value;
    this._inputValue = value;
    this._model = this._fromDateStruct(this.parserFormatter.parse(value));
    return this._model ? this.dateAdapter.toModel(this._model) : value === "" ? null : value;
  }

  private _selectDate(date: NgbDate): void {
    if (!this.dateAdapter) return;
    this._model = date;
    const value = this.dateAdapter.toModel(date);
    this._writeModelValue(date);
    this._onChange(value);
    this._onTouched();
    this.dateSelect?.({ $event: date });
    if (this.autoClose === true || this.autoClose === "inside") this.close();
  }

  private _writeModelValue(model: NgbDate | null): void {
    if (!this.parserFormatter || !this.dateAdapter) return;
    const value = this.parserFormatter.format(model);
    this._inputValue = value;
    this._nativeElement.value = value;
    this._windowRef?.componentInstance?.writeValue(this.dateAdapter.toModel(model));
  }

  private _fromDateStruct(date: NgbDateStruct | null): NgbDate | null {
    const ngbDate = date ? new NgbDate(date.year, date.month, date.day) : null;
    return this.calendar?.isValid(ngbDate) ? ngbDate : null;
  }

  private _applyDatepickerInputs(windowRef: ContentRef<NgbDatepicker>): void {
    windowRef.setInput("calendar", this.calendar);
    windowRef.setInput("dateAdapter", this.dateAdapter);
    if (this.i18n) windowRef.setInput("i18n", this.i18n);
    for (const name of DATEPICKER_INPUTS) {
      const value = this[name];
      if (value !== undefined) windowRef.setInput(name, value);
    }
  }

  private _resolvePositionTarget(): HTMLElement {
    if (typeof this.positionTarget === "string") {
      const target = document.querySelector<HTMLElement>(this.positionTarget);
      if (!target) throw new Error(`ngbDatepicker could not find positionTarget "${this.positionTarget}".`);
      return target;
    }
    return this.positionTarget instanceof HTMLElement ? this.positionTarget : this._nativeElement;
  }

  private _setCloseHandlers(): void {
    this._closed$.next();
    const popupElement = this._windowRef ? toNativeElement(this._windowRef.$element) : null;
    if (!popupElement) return;
    ngbAutoClose(
      this._ngZone,
      this.autoClose,
      this._closed$,
      () => this.close(),
      [popupElement],
      [this._nativeElement],
    );
  }

  private _restoreFocus(): void {
    let element = this._elementWithFocus;
    if (typeof this.restoreFocus === "string") element = document.querySelector<HTMLElement>(this.restoreFocus);
    else if (this.restoreFocus instanceof HTMLElement) element = this.restoreFocus;
    (element ?? document.body).focus?.();
  }

  private readonly _handleChange = () => this.manualDateChange(this._nativeElement.value, true);
  public onFocus(): void {
    this._elementWithFocus = this._nativeElement;
  }
  public onBlur(): void {
    this._onTouched();
  }
  private readonly _handleFocus = () => this.onFocus();
  private readonly _handleBlur = () => this.onBlur();

  static get $name() {
    return "ngbDatepicker";
  }

  static get $inject() {
    return [
      "$element",
      "$scope",
      NgbInputDatepickerConfig.$name,
      NgZone.$name,
      ChangeDetectorRef.$name,
      "$compile",
      "$rootScope",
      NgbRTL.$name,
    ];
  }

  static get $factory(): () => IDirective {
    return () => ({
      bindToController: {
        autoClose: "<?",
        calendar: "<?",
        contentTemplate: "<?",
        datepickerClass: "@?",
        dateAdapter: "<?",
        dayTemplate: "<?",
        dayTemplateData: "<?",
        displayMonths: "<?",
        firstDayOfWeek: "<?",
        footerTemplate: "<?",
        markDisabled: "<?",
        i18n: "<?",
        minDate: "<?",
        maxDate: "<?",
        navigation: "@?",
        outsideDays: "@?",
        placement: "<?",
        parserFormatter: "<?",
        popperOptions: "<?",
        restoreFocus: "<?",
        showWeekNumbers: "<?",
        startDate: "<?",
        container: "@?",
        positionTarget: "<?",
        weekdays: "<?",
        disabled: "<?",
        dateSelect: "&?",
        navigate: "&?",
        closed: "&?",
      },
      controller: NgbInputDatepicker,
      controllerAs: "$datepicker",
      require: {
        ngModelCtrl: "?ngModel",
        ngDisabled: "?ngDisabled",
      },
      restrict: "A",
      scope: false,
    });
  }
}
