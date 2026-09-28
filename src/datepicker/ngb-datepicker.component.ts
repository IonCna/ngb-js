import { NgbDateAdapter } from "@ngb/datepicker/adapters/ngb-date-adapter.ts";
import { NgbCalendar } from "@ngb/datepicker/ngb-calendar.service.ts";
import { NgbDate } from "@ngb/datepicker/ngb-date.ts";
import type { NgbDatepickerNavigateEvent, NgbDatepickerState, NgbDateStruct } from "@ngb/datepicker/ngb-date-struct.ts";
import { type DatepickerServiceInputs, NgbDatepickerService } from "@ngb/datepicker/ngb-datepicker.service.ts";
import { NgbDatepickerConfig } from "@ngb/datepicker/ngb-datepicker-config.service.ts";
import { NgbDatepickerContent } from "@ngb/datepicker/ngb-datepicker-content.component.ts";
import type { ContentTemplateContext } from "@ngb/datepicker/ngb-datepicker-content-template-context.ts";
import type { DayTemplateContext } from "@ngb/datepicker/ngb-datepicker-day-template-context.ts";
import { NgbDatepickerI18n } from "@ngb/datepicker/ngb-datepicker-i18n.service.ts";
import { isChangedDate, isChangedMonth } from "@ngb/datepicker/ngb-datepicker-tools.ts";
import { type DatepickerViewModel, NavigationEvent } from "@ngb/datepicker/ngb-datepicker-view-model.ts";
import {
  type AfterContentInit,
  type AfterViewInit,
  ChangeDetectorRef,
  Component,
  ContentChild,
  DestroyRef,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostBinding,
  Input,
  inject,
  NgZone,
  type OnChanges,
  type OnInit,
  Output,
  type SimpleChanges,
  TemplateRef,
  ViewChild,
} from "ngjs-core";
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from "ngjs-core/forms";
import { takeUntilDestroyed } from "ngjs-core/rxjs-interop";
import { fromEvent, merge, take } from "rxjs";
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
  template: `<style>
  /* Compiled from ng-bootstrap datepicker*.scss (ViewEncapsulation.None) — inline porque
     ngjs-core no soporta \`styleUrl\` (no auto-inyecta CSS de componente). */
  ngb-datepicker {
    border: 1px solid var(--bs-border-color);
    border-radius: 0.25rem;
    display: inline-block;
  }

  ngb-datepicker-month {
    pointer-events: auto;
  }

  ngb-datepicker.dropdown-menu {
    padding: 0;
  }

  ngb-datepicker.disabled .ngb-dp-weekday,
  ngb-datepicker.disabled .ngb-dp-week-number,
  ngb-datepicker.disabled .ngb-dp-month-name {
    color: var(--bs-text-muted);
  }

  .ngb-dp-body {
    z-index: 1055;
  }

  .ngb-dp-header {
    border-bottom: 0;
    border-radius: 0.25rem 0.25rem 0 0;
    padding-top: 0.25rem;
    background-color: var(--bs-tertiary-bg);
  }

  .ngb-dp-months {
    display: flex;
  }

  .ngb-dp-month {
    pointer-events: none;
  }

  .ngb-dp-month-name {
    font-size: larger;
    height: 2rem;
    line-height: 2rem;
    text-align: center;
    background-color: var(--bs-tertiary-bg);
  }

  .ngb-dp-month + .ngb-dp-month .ngb-dp-month-name,
  .ngb-dp-month + .ngb-dp-month .ngb-dp-week {
    padding-left: 1rem;
  }

  .ngb-dp-month:last-child .ngb-dp-week {
    padding-right: 0.25rem;
  }

  .ngb-dp-month:first-child .ngb-dp-week {
    padding-left: 0.25rem;
  }

  .ngb-dp-month .ngb-dp-week:last-child {
    padding-bottom: 0.25rem;
  }

  [ngbDatepickerDayView] {
    text-align: center;
    width: 2rem;
    height: 2rem;
    line-height: 2rem;
    border-radius: 0.25rem;
    background: transparent;
  }

  [ngbDatepickerDayView]:hover:not(.bg-primary),
  [ngbDatepickerDayView].active:not(.bg-primary) {
    background-color: var(--bs-tertiary-bg);
    outline: 1px solid var(--bs-border-color);
  }

  [ngbDatepickerDayView].outside {
    opacity: 0.5;
  }

  ngb-datepicker-month {
    display: block;
  }

  .ngb-dp-weekday,
  .ngb-dp-week-number {
    line-height: 2rem;
    text-align: center;
    font-style: italic;
  }

  .ngb-dp-weekday {
    color: var(--bs-info);
  }

  .ngb-dp-week {
    border-radius: 0.25rem;
    display: flex;
  }

  .ngb-dp-weekdays {
    border-bottom: 1px solid var(--bs-border-color);
    border-radius: 0;
    background-color: var(--bs-tertiary-bg);
  }

  .ngb-dp-day,
  .ngb-dp-weekday,
  .ngb-dp-week-number {
    width: 2rem;
    height: 2rem;
  }

  .ngb-dp-day {
    cursor: pointer;
  }

  .ngb-dp-day.disabled,
  .ngb-dp-day.hidden {
    cursor: default;
    pointer-events: none;
  }

  .ngb-dp-day[tabindex="0"] {
    z-index: 1;
  }

  ngb-datepicker-navigation {
    display: flex;
    align-items: center;
  }

  .ngb-dp-navigation-chevron {
    border-style: solid;
    border-width: 0.2em 0.2em 0 0;
    display: inline-block;
    width: 0.75em;
    height: 0.75em;
    margin-left: 0.25em;
    margin-right: 0.15em;
    transform: rotate(-135deg);
  }

  .ngb-dp-arrow {
    display: flex;
    flex: 1 1 auto;
    padding-right: 0;
    padding-left: 0;
    margin: 0;
    width: 2rem;
    height: 2rem;
  }

  .ngb-dp-arrow-next {
    justify-content: flex-end;
  }

  .ngb-dp-arrow-next .ngb-dp-navigation-chevron {
    transform: rotate(45deg);
    margin-left: 0.15em;
    margin-right: 0.25em;
  }

  .ngb-dp-arrow-btn {
    padding: 0 0.25rem;
    margin: 0 0.5rem;
    border: none;
    background-color: transparent;
    z-index: 1;
  }

  .ngb-dp-arrow-btn:focus {
    outline-width: 1px;
    outline-style: auto;
  }

  .ngb-dp-navigation-select {
    display: flex;
    flex: 1 1 9rem;
  }

  ngb-datepicker-navigation-select > .form-select {
    flex: 1 1 auto;
    padding: 0 0.5rem;
    font-size: 0.875rem;
    height: 1.85rem;
  }

  ngb-datepicker-navigation-select > .form-select:focus {
    z-index: 1;
  }

  ngb-datepicker-navigation-select > .form-select::-ms-value {
    background-color: transparent !important;
  }
</style>

<ng-template
  ng-ref="defaultDayTemplate"
  let-date="date"
  let-current-month="currentMonth"
  let-selected="selected"
  let-disabled="disabled"
  let-focused="focused">
  <div
    ngb-datepicker-day-view
    date="date"
    current-month="currentMonth"
    selected="selected"
    disabled="disabled"
    focused="focused"
    class="btn btn-light border-0 p-0 text-center rounded-1"
    style="width: 2rem; height: 2rem; line-height: 2rem; background: transparent">
  </div>
</ng-template>

<ng-template ng-ref="defaultContentTemplate">
  <div
    ng-repeat="month in $.model.months track by $index"
    class="ngb-dp-month pe-none"
    ng-class="{ 'ps-3': !$first, 'ps-1': $first, 'pe-1': $last }">
    <div
      ng-if="$.navigation === 'none' || ($.displayMonths > 1 && $.navigation === 'select')"
      class="ngb-dp-month-name fs-5 text-center bg-body-tertiary"
      ng-class="{ 'text-muted': $.model.disabled }"
      style="height: 2rem; line-height: 2rem">
      {{ $.i18n.getMonthLabel(month.firstDate) }}
    </div>
    <ngb-datepicker-month class="d-block pe-auto" month="month.firstDate"></ngb-datepicker-month>
  </div>
</ng-template>

<div class="ngb-dp-header pt-1 border-bottom-0 rounded-top bg-body-tertiary">
  <ngb-datepicker-navigation
    ng-if="$.navigation !== 'none' && $.model"
    date="$.model.firstDate"
    months="$.model.months"
    disabled="$.model.disabled"
    show-select="$.model.navigation === 'select'"
    prev-disabled="$.model.prevDisabled"
    next-disabled="$.model.nextDisabled"
    select-boxes="$.model.selectBoxes"
    navigate="$.onNavigateEvent($event)"
    select="$.onNavigateDateSelect($event)"
    class="d-flex align-items-center">
  </ngb-datepicker-navigation>
</div>

<div
  class="ngb-dp-content"
  ng-class="{ 'ngb-dp-months': !$.contentTemplate, 'd-flex': !$.contentTemplate }"
  ng-ref="content">
  <ng-template
    ng-if="$.model"
    ng-template-outlet="$.contentTemplate || $.contentTemplateFromContent || defaultContentTemplate"
    ng-template-outlet-context="{ $implicit: $ }">
  </ng-template>
</div>

<ng-template ng-if="$.footerTemplate" ng-template-outlet="$.footerTemplate"></ng-template>
<ng-content></ng-content>`,
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

  private _service = inject(NgbDatepickerService);
  private _calendar = inject(NgbCalendar);
  private _i18n = inject(NgbDatepickerI18n);
  private _config = inject(NgbDatepickerConfig);
  private _nativeElement = inject(ElementRef).nativeElement as HTMLElement;
  private _ngbDateAdapter = inject<NgbDateAdapter<any>>(NgbDateAdapter);
  private _ngZone = inject(NgZone);
  private _destroyRef = inject(DestroyRef);

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
    this._ngZone.onStable.pipe(take(1)).subscribe(() => {
      this._nativeElement.querySelector<HTMLElement>('div.ngb-dp-day[tabindex="0"]')?.focus();
    });
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
