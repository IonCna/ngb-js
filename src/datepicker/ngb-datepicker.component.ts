import { NgbDateAdapter } from "@ngb/datepicker/adapters/ngb-date-adapter.ts";
import { NgbCalendar } from "@ngb/datepicker/ngb-calendar.service.ts";
import { NgbDate } from "@ngb/datepicker/ngb-date.ts";
import type {
  NgbDatepickerNavigateEvent,
  NgbDatepickerState,
  NgbDateStruct,
} from "@ngb/datepicker/ngb-date-struct.ts";
import template from "@ngb/datepicker/ngb-datepicker.component.html";
import { type DatepickerServiceInputs, NgbDatepickerService } from "@ngb/datepicker/ngb-datepicker.service.ts";
import { NgbDatepickerConfig } from "@ngb/datepicker/ngb-datepicker-config.service.ts";
import { NgbDatepickerContent } from "@ngb/datepicker/ngb-datepicker-content.component.ts";
import type { ContentTemplateContext } from "@ngb/datepicker/ngb-datepicker-content-template-context.ts";
import type { DayTemplateContext } from "@ngb/datepicker/ngb-datepicker-day-template-context.ts";
import { NgbDatepickerI18n } from "@ngb/datepicker/ngb-datepicker-i18n.service.ts";
import { isChangedDate, isChangedMonth } from "@ngb/datepicker/ngb-datepicker-tools.ts";
import {
  type DatepickerViewModel,
  NavigationEvent,
} from "@ngb/datepicker/ngb-datepicker-view-model.ts";
import {
  type AfterContentInit,
  type AfterViewInit,
  afterNextRender,
  ChangeDetectorRef,
  Component,
  ContentChild,
  type ControlValueAccessor,
  DestroyRef,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostBinding,
  inject,
  Injector,
  Input,
  NG_VALUE_ACCESSOR,
  NgZone,
  type OnChanges,
  type OnInit,
  Output,
  type SimpleChanges,
  takeUntilDestroyed,
  TemplateRef,
  ViewChild,
} from "ngjs-core";
import { fromEvent, merge } from "rxjs";
import { filter } from "rxjs/operators";

// upstream inlinea este array en `ngOnInit`/`ngOnChanges`; acá va arriba para
// tiparlo (ngb-js corre con `strict` — ver notas).
const SERVICE_INPUT_NAMES: (keyof DatepickerServiceInputs)[] = [
  "dayTemplateData",
  "displayMonths",
  "markDisabled",
  "firstDayOfWeek",
  "navigation",
  "minDate",
  "maxDate",
  "outsideDays",
  "weekdays",
];

/**
 * A highly configurable component that helps you with selecting calendar dates.
 *
 * `NgbDatepicker` is meant to be displayed inline on a page or put inside a popup.
 */
@Component({
  exportAs: "ngbDatepicker",
  selector: "ngb-datepicker",
  controllerAs: "$",
  template,
  transclude: true,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NgbDatepicker), multi: true },
    NgbDatepickerService,
  ],
})
export class NgbDatepicker implements AfterContentInit, AfterViewInit, OnChanges, OnInit, ControlValueAccessor {
  static ngAcceptInputType_autoClose: boolean | string;
  static ngAcceptInputType_navigation: string;
  static ngAcceptInputType_outsideDays: string;
  static ngAcceptInputType_weekdays: boolean | string;

  model!: DatepickerViewModel;

  @ViewChild("defaultDayTemplate", { static: true }) private _defaultDayTemplate!: TemplateRef<DayTemplateContext>;
  @ViewChild("content", { read: ElementRef, static: true }) private _contentEl!: ElementRef<HTMLElement>;

  protected injector = inject(Injector);

  private _service = inject(NgbDatepickerService);
  private _calendar = inject(NgbCalendar);
  private _i18n = inject(NgbDatepickerI18n);
  private _config = inject(NgbDatepickerConfig);
  private _nativeElement = inject(ElementRef).nativeElement as HTMLElement;
  private _ngbDateAdapter = inject<NgbDateAdapter<any>>(NgbDateAdapter);
  private _ngZone = inject(NgZone);
  private _destroyRef = inject(DestroyRef);
  private _injector = inject(Injector);

  private _controlValue: NgbDate | null = null;
  private _publicState: NgbDatepickerState = <any>{};
  private _initialized = false;

  /**
   * The reference to a custom content template.
   *
   * Allows to completely override the way datepicker displays months.
   *
   * @since 14.2.0
   */
  @Input() contentTemplate?: TemplateRef<ContentTemplateContext>;
  @ContentChild(NgbDatepickerContent, { read: TemplateRef, static: true })
  contentTemplateFromContent?: TemplateRef<ContentTemplateContext>;

  /**
   * The reference to a custom template for the day.
   */
  @Input() dayTemplate = this._config.dayTemplate;

  /**
   * The callback to pass any arbitrary data to the template cell via the
   * [`DayTemplateContext`](#/components/datepicker/api#DayTemplateContext)'s `data` parameter.
   *
   * @since 3.3.0
   */
  @Input() dayTemplateData = this._config.dayTemplateData;

  /**
   * The number of months to display.
   */
  @Input() displayMonths = this._config.displayMonths;

  /**
   * The first day of the week.
   */
  @Input() firstDayOfWeek = this._config.firstDayOfWeek;

  /**
   * The reference to the custom template for the datepicker footer.
   *
   * @since 3.3.0
   */
  @Input() footerTemplate = this._config.footerTemplate;

  /**
   * The callback to mark some dates as disabled.
   */
  @Input() markDisabled = this._config.markDisabled;

  /**
   * The latest date that can be displayed or selected.
   */
  @Input() maxDate = this._config.maxDate;

  /**
   * The earliest date that can be displayed or selected.
   */
  @Input() minDate = this._config.minDate;

  /**
   * Navigation type.
   */
  @Input() navigation = this._config.navigation;

  /**
   * The way of displaying days that don't belong to the current month.
   */
  @Input() outsideDays = this._config.outsideDays;

  /**
   * If `true`, week numbers will be displayed.
   */
  @Input() showWeekNumbers = this._config.showWeekNumbers;

  /**
   * The date to open calendar with.
   */
  @Input() startDate = this._config.startDate;

  /**
   * The way weekdays should be displayed.
   *
   * @since 9.1.0
   */
  @Input() weekdays = this._config.weekdays;

  /**
   * An event emitted right before the navigation happens and displayed month changes.
   */
  @Output() navigate = new EventEmitter<NgbDatepickerNavigateEvent>();

  /**
   * An event emitted when user selects a date using keyboard or mouse.
   *
   * @since 5.2.0
   */
  @Output() dateSelect = new EventEmitter<NgbDate>();

  onChange = (_: any) => {};
  onTouched = () => {};

  @HostBinding("class.disabled") get _hostDisabled(): boolean {
    return !!this.model?.disabled;
  }

  constructor() {
    const cd = inject(ChangeDetectorRef);

    this._service.dateSelect$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((date) => {
      this.dateSelect.emit(date);
    });

    this._service.model$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((model) => {
      const newDate = model.firstDate!;
      const oldDate = this.model ? this.model.firstDate : null;

      // update public state
      this._publicState = {
        maxDate: model.maxDate,
        minDate: model.minDate,
        firstDate: model.firstDate!,
        lastDate: model.lastDate!,
        focusedDate: model.focusDate!,
        months: model.months.map((viewModel) => viewModel.firstDate),
      };

      let navigationPrevented = false;
      // emitting navigation event if the first month changes
      if (!newDate.equals(oldDate)) {
        this.navigate.emit({
          current: oldDate ? { year: oldDate.year, month: oldDate.month } : null,
          next: { year: newDate.year, month: newDate.month },
          preventDefault: () => (navigationPrevented = true),
        });

        // can't prevent the very first navigation
        if (navigationPrevented && oldDate !== null) {
          this._service.open(oldDate);
          return;
        }
      }

      const newSelectedDate = model.selectedDate;
      const newFocusedDate = model.focusDate;
      const oldFocusedDate = this.model ? this.model.focusDate : null;

      this.model = model;

      // handling selection change
      if (isChangedDate(newSelectedDate, this._controlValue)) {
        this._controlValue = newSelectedDate;
        this.onTouched();
        this.onChange(this._ngbDateAdapter.toModel(newSelectedDate));
      }

      // handling focus change
      if (isChangedDate(newFocusedDate, oldFocusedDate) && oldFocusedDate && model.focusVisible) {
        this.focus();
      }

      cd.markForCheck();
    });
  }

  /**
   *  Returns the readonly public state of the datepicker
   *
   * @since 5.2.0
   */
  get state(): NgbDatepickerState {
    return this._publicState;
  }

  /**
   *  Returns the calendar service used in the specific datepicker instance.
   *
   *  @since 5.3.0
   */
  get calendar(): NgbCalendar {
    return this._calendar;
  }

  /**
   * Returns the i18n service used in the specific datepicker instance.
   *
   * @since 14.2.0
   */
  get i18n(): NgbDatepickerI18n {
    return this._i18n;
  }

  /**
   *  Focuses on given date.
   */
  focusDate(date?: NgbDateStruct | null): void {
    this._service.focus(NgbDate.from(date));
  }

  /**
   *  Selects focused date.
   */
  focusSelect(): void {
    this._service.focusSelect();
  }

  focus() {
    afterNextRender(
      {
        read: () => {
          this._nativeElement.querySelector<HTMLElement>('div.ngb-dp-day[tabindex="0"]')?.focus();
        },
      },
      { injector: this._injector },
    );
  }

  /**
   * Navigates to the provided date.
   */
  navigateTo(date?: { year: number; month: number; day?: number }) {
    this._service.open(NgbDate.from(date ? (date.day ? (date as NgbDateStruct) : { ...date, day: 1 }) : null));
  }

  ngAfterContentInit() {
    // `@ViewChild({ static: true })` en ngjs-core resuelve en el `$postLink`, no
    // antes de `ngOnInit` (Angular). El fallback del template va acá.
    if (!this.dayTemplate) {
      this.dayTemplate = this._defaultDayTemplate;
    }
  }

  ngAfterViewInit() {
    this._ngZone.runOutsideAngular(() => {
      const focusIns$ = fromEvent<FocusEvent>(this._contentEl.nativeElement, "focusin");
      const focusOuts$ = fromEvent<FocusEvent>(this._contentEl.nativeElement, "focusout");

      // we're changing 'focusVisible' only when entering or leaving months view
      // and ignoring all focus events where both 'target' and 'related' target are day cells
      merge(focusIns$, focusOuts$)
        .pipe(
          filter((focusEvent) => {
            const target = focusEvent.target as HTMLElement | null;
            const relatedTarget = focusEvent.relatedTarget as HTMLElement | null;

            return !(
              target?.classList.contains("ngb-dp-day") &&
              relatedTarget?.classList.contains("ngb-dp-day") &&
              this._nativeElement.contains(target) &&
              this._nativeElement.contains(relatedTarget)
            );
          }),
          takeUntilDestroyed(this._destroyRef),
        )
        .subscribe(({ type }) => this._ngZone.run(() => this._service.set({ focusVisible: type === "focusin" })));
    });
  }

  ngOnInit() {
    if (this.model === undefined) {
      const inputs: DatepickerServiceInputs = {};
      SERVICE_INPUT_NAMES.forEach((name) => (inputs[name] = (this as any)[name]));
      this._service.set(inputs);

      this.navigateTo(this.startDate);
    }
    this._initialized = true;
  }

  ngOnChanges(changes: SimpleChanges) {
    const inputs: DatepickerServiceInputs = {};
    SERVICE_INPUT_NAMES.filter((name) => name in changes).forEach((name) => (inputs[name] = (this as any)[name]));
    this._service.set(inputs);

    if ("startDate" in changes && this._initialized) {
      const { currentValue, previousValue } = changes.startDate;
      if (isChangedMonth(previousValue as NgbDate, currentValue as NgbDate)) {
        this.navigateTo(this.startDate);
      }
    }
  }

  onDateSelect(date: NgbDate) {
    this._service.focus(date);
    this._service.select(date, { emitEvent: true });
  }

  onNavigateDateSelect(date: NgbDate) {
    this._service.open(date);
  }

  onNavigateEvent(event: NavigationEvent) {
    switch (event) {
      case NavigationEvent.PREV:
        this._service.open(this._calendar.getPrev(this.model.firstDate!, "m", 1));
        break;
      case NavigationEvent.NEXT:
        this._service.open(this._calendar.getNext(this.model.firstDate!, "m", 1));
        break;
    }
  }

  registerOnChange(fn: (value: any) => any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => any): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean) {
    this._service.set({ disabled });
  }

  writeValue(value: any) {
    this._controlValue = NgbDate.from(this._ngbDateAdapter.fromModel(value));
    this._service.select(this._controlValue);
  }
}
