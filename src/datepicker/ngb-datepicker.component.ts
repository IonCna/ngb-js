import { type NgbDateAdapter, NgbDateStructAdapter } from "@ngb/datepicker/adapters/ngb-date-adapter.ts";
import { type NgbCalendar, NgbCalendarGregorian } from "@ngb/datepicker/ngb-calendar.service.ts";
import { NgbDate } from "@ngb/datepicker/ngb-date.ts";
import type { NgbDatepickerNavigateEvent, NgbDatepickerState, NgbDateStruct } from "@ngb/datepicker/ngb-date-struct.ts";
import template from "@ngb/datepicker/ngb-datepicker.component.html";
import { type DatepickerServiceInputs, NgbDatepickerService } from "@ngb/datepicker/ngb-datepicker.service.ts";
import { NgbDatepickerConfig } from "@ngb/datepicker/ngb-datepicker-config.service.ts";
import { NgbDatepickerContent } from "@ngb/datepicker/ngb-datepicker-content.component.ts";
import type { ContentTemplateContext } from "@ngb/datepicker/ngb-datepicker-content-template-context.ts";
import type { DayTemplateContext } from "@ngb/datepicker/ngb-datepicker-day-template-context.ts";
import { type NgbDatepickerI18n, NgbDatepickerI18nDefault } from "@ngb/datepicker/ngb-datepicker-i18n.service.ts";
import { NgbDatepickerKeyboardService } from "@ngb/datepicker/ngb-datepicker-keyboard.service.ts";
import { isChangedDate, isChangedMonth } from "@ngb/datepicker/ngb-datepicker-tools.ts";
import {
  type DatepickerViewModel,
  type MonthViewModel,
  NavigationEvent,
} from "@ngb/datepicker/ngb-datepicker-view-model.ts";
import type {
  IAugmentedJQuery,
  IComponentController,
  IComponentOptions,
  IFilterService,
  ILocaleService,
  INgModelController,
  IOnChangesObject,
  IScope,
} from "angular";
import { ChangeDetectorRef, ContentChild, type NgDisabled, type TemplateRef, ViewChild } from "ngjs-core";
import type { Subscription } from "rxjs";

const SERVICE_INPUTS = [
  "dayTemplateData",
  "displayMonths",
  "markDisabled",
  "firstDayOfWeek",
  "navigation",
  "minDate",
  "maxDate",
  "outsideDays",
  "weekdays",
] as const;

export class NgbDatepicker implements IComponentController {
  public model!: DatepickerViewModel;
  public calendar!: NgbCalendar;
  public dateAdapter?: NgbDateAdapter<unknown>;
  public i18n!: NgbDatepickerI18n;
  public contentTemplate?: TemplateRef<ContentTemplateContext>;
  public dayTemplate?: TemplateRef<DayTemplateContext>;
  public dayTemplateData?: DatepickerServiceInputs["dayTemplateData"];
  public displayMonths!: number;
  public firstDayOfWeek!: number;
  public footerTemplate?: TemplateRef<unknown>;
  public markDisabled?: DatepickerServiceInputs["markDisabled"];
  public maxDate?: NgbDateStruct;
  public minDate?: NgbDateStruct;
  public navigation!: "select" | "arrows" | "none";
  public outsideDays!: "visible" | "collapsed" | "hidden";
  public showWeekNumbers!: boolean;
  public startDate?: { year: number; month: number; day?: number };
  public weekdays!: Exclude<Intl.DateTimeFormatOptions["weekday"], undefined> | boolean;
  public dateSelect?: (locals: { $event: NgbDate }) => void;
  public navigate?: (locals: { $event: NgbDatepickerNavigateEvent }) => void;
  public ngDisabled?: NgDisabled;

  @ViewChild("defaultDayTemplate", { read: undefined, static: true })
  private _defaultDayTemplate!: TemplateRef<DayTemplateContext>;

  @ContentChild(NgbDatepickerContent, { static: true })
  public contentTemplateFromContent?: NgbDatepickerContent;

  private ngModelCtrl?: INgModelController;
  private _service!: NgbDatepickerService;
  private readonly _keyboardService = new NgbDatepickerKeyboardService();
  private _controlValue: NgbDate | null = null;
  private _publicState!: NgbDatepickerState;
  private _initialized = false;
  private _modelSubscription?: Subscription;
  private _dateSelectSubscription?: Subscription;
  private _removeDisabledListener?: () => void;
  public onChange: (value: unknown) => void = () => undefined;
  public onTouched: () => void = () => undefined;

  constructor(
    private readonly $element: IAugmentedJQuery,
    private readonly $scope: IScope,
    private readonly $locale: ILocaleService,
    private readonly $filter: IFilterService,
    private readonly _config: NgbDatepickerConfig,
    private readonly _changeDetector: ChangeDetectorRef,
  ) {}

  private _subscribeToService(): void {
    this._dateSelectSubscription = this._service.dateSelect$.subscribe((date) => {
      this.$scope.$evalAsync(() => this.dateSelect?.({ $event: date }));
    });
    this._modelSubscription = this._service.model$.subscribe((model) => {
      this.$scope.$evalAsync(() => this._applyModel(model));
    });
  }

  $onInit(): void {
    this.calendar = this.calendar ?? new NgbCalendarGregorian();
    this.dateAdapter = this.dateAdapter ?? new NgbDateStructAdapter();
    this.i18n = this.i18n ?? new NgbDatepickerI18nDefault(this.$locale, this.$filter);
    this._createService();

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
    this.showWeekNumbers = this.showWeekNumbers ?? this._config.showWeekNumbers;
    this.startDate = this.startDate ?? this._config.startDate;
    this.weekdays = this.weekdays ?? this._config.weekdays;

    this._service.set(this._collectInputs());

    if (this.ngModelCtrl) {
      this.registerOnChange((value) => this.ngModelCtrl?.$setViewValue(value));
      this.registerOnTouched(() => this.ngModelCtrl?.$setTouched());
      this.ngModelCtrl.$render = () => this.writeValue(this.ngModelCtrl?.$viewValue);
      this.ngModelCtrl.$render();
    }

    this.navigateTo(this.startDate ?? this._controlValue);
    this._initialized = true;
  }

  $postLink(): void {
    this.dayTemplate = this.dayTemplate ?? this._defaultDayTemplate;
    this.$element.addClass("d-inline-block border rounded-1");
    this.$element.toggleClass("disabled", !!this.model?.disabled);
    this.$element.on("focusin focusout", this._handleFocusChange);
    this._removeDisabledListener = this.ngDisabled?.onChange((disabled) => this.setDisabledState(disabled));
    if (this.ngDisabled) this.setDisabledState(this.ngDisabled.disabled);
  }

  $onChanges(changes: IOnChangesObject): void {
    if (!this._initialized) return;

    if (changes.calendar || changes.i18n) {
      this.calendar = this.calendar ?? new NgbCalendarGregorian();
      this.i18n = this.i18n ?? new NgbDatepickerI18nDefault(this.$locale, this.$filter);
      this._createService();
      this._service.set(this._collectInputs());
      this._service.select(this._controlValue);
      this.navigateTo(this.startDate ?? this._controlValue);
      return;
    }

    const inputs = this._collectInputs(SERVICE_INPUTS.filter((name) => name in changes));
    this._service.set(inputs);

    const startDateChange = changes.startDate;
    if (startDateChange && isChangedMonth(startDateChange.previousValue, startDateChange.currentValue)) {
      this.navigateTo(this.startDate);
    }
  }

  $onDestroy(): void {
    this.$element.off("focusin focusout", this._handleFocusChange);
    this._removeDisabledListener?.();
    this._modelSubscription?.unsubscribe();
    this._dateSelectSubscription?.unsubscribe();
  }

  get state(): NgbDatepickerState {
    return this._publicState;
  }

  getMonth(struct: NgbDateStruct): MonthViewModel {
    return this._service.getMonth(struct);
  }

  processKey(event: KeyboardEvent | JQueryEventObject): void {
    this._keyboardService.processKey(event, this);
  }

  focusDate(date?: NgbDateStruct | null): void {
    this._service.focus(NgbDate.from(date));
  }

  focusSelect(): void {
    this._service.focusSelect();
  }

  focus(): void {
    queueMicrotask(() => {
      this.$element[0].querySelector<HTMLElement>('div.ngb-dp-day[tabindex="0"]')?.focus();
    });
  }

  navigateTo(date?: { year: number; month: number; day?: number } | null): void {
    const target = date ? NgbDate.from(date.day ? (date as NgbDateStruct) : { ...date, day: 1 }) : null;
    this._service.open(target);
  }

  onDateSelect(date: NgbDate): void {
    this._service.focus(date);
    this._service.select(date, { emitEvent: true });
  }

  onNavigateDateSelect(date: NgbDate): void {
    this._service.open(date);
  }

  onNavigateEvent(event: NavigationEvent): void {
    const firstDate = this.model.firstDate;
    if (!firstDate) return;
    if (event === NavigationEvent.PREV) {
      this._service.open(this.calendar.getPrev(firstDate, "m", 1));
    } else if (event === NavigationEvent.NEXT) {
      this._service.open(this.calendar.getNext(firstDate, "m", 1));
    }
  }

  setDisabledState(disabled: boolean): void {
    this._service.set({ disabled });
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  writeValue(value: unknown): void {
    if (!this.dateAdapter) return;
    this._controlValue = NgbDate.from(this.dateAdapter.fromModel(value));
    this._service.select(this._controlValue);
  }

  private _collectInputs(names: readonly (keyof DatepickerServiceInputs)[] = SERVICE_INPUTS): DatepickerServiceInputs {
    const inputs: DatepickerServiceInputs = {};
    for (const name of names) {
      const value = this[name as keyof this];
      (inputs as Record<string, unknown>)[name] = value;
    }
    return inputs;
  }

  private _createService(): void {
    this._modelSubscription?.unsubscribe();
    this._dateSelectSubscription?.unsubscribe();
    this._service = new NgbDatepickerService(this.$locale, this.$filter, this.calendar, this.i18n);
    this._subscribeToService();
  }

  private _applyModel(model: DatepickerViewModel): void {
    const newDate = model.firstDate;
    const lastDate = model.lastDate;
    const focusedDate = model.focusDate;
    if (!newDate || !lastDate || !focusedDate) return;
    const oldDate = this.model?.firstDate ?? null;
    let navigationPrevented = false;

    if (!newDate.equals(oldDate)) {
      this.navigate?.({
        $event: {
          current: oldDate ? { year: oldDate.year, month: oldDate.month } : null,
          next: { year: newDate.year, month: newDate.month },
          preventDefault: () => {
            navigationPrevented = true;
          },
        },
      });
      if (navigationPrevented && oldDate) {
        this._service.open(oldDate);
        return;
      }
    }

    const oldFocusedDate = this.model?.focusDate ?? null;
    this.model = model;
    this._publicState = {
      maxDate: model.maxDate,
      minDate: model.minDate,
      firstDate: newDate,
      lastDate,
      focusedDate,
      months: model.months.map((month) => month.firstDate),
    };

    if (isChangedDate(model.selectedDate, this._controlValue)) {
      this._controlValue = model.selectedDate;
      this.onTouched();
      this.onChange(this.dateAdapter?.toModel(model.selectedDate));
    }

    if (isChangedDate(model.focusDate, oldFocusedDate) && oldFocusedDate && model.focusVisible) this.focus();

    this.$element.toggleClass("disabled", model.disabled);
    this._changeDetector.markForCheck();
  }

  private readonly _handleFocusChange = (event: JQueryEventObject) => {
    const target = event.target as HTMLElement | null;
    const relatedTarget = event.relatedTarget as HTMLElement | null;
    const bothDays =
      target?.classList.contains("ngb-dp-day") &&
      relatedTarget?.classList.contains("ngb-dp-day") &&
      this.$element[0].contains(target) &&
      this.$element[0].contains(relatedTarget);
    if (!bothDays) this.$scope.$evalAsync(() => this._service.set({ focusVisible: event.type === "focusin" }));
  };

  static get $name() {
    return "ngbDatepicker";
  }

  static get $inject() {
    return ["$element", "$scope", "$locale", "$filter", NgbDatepickerConfig.$name, ChangeDetectorRef.$name];
  }

  static get $factory(): IComponentOptions {
    return {
      bindings: {
        contentTemplate: "<?",
        calendar: "<?",
        dateAdapter: "<?",
        dayTemplate: "<?",
        dayTemplateData: "<?",
        displayMonths: "<?",
        firstDayOfWeek: "<?",
        footerTemplate: "<?",
        i18n: "<?",
        markDisabled: "<?",
        maxDate: "<?",
        minDate: "<?",
        navigation: "@?",
        outsideDays: "@?",
        showWeekNumbers: "<?",
        startDate: "<?",
        weekdays: "<?",
        dateSelect: "&?",
        navigate: "&?",
      },
      controller: NgbDatepicker,
      controllerAs: "$",
      require: {
        ngModelCtrl: "?ngModel",
        ngDisabled: "?ngDisabled",
      },
      transclude: true,
      template,
    };
  }
}
