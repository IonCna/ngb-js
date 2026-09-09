import { NgbTime } from "@ngb/timepicker/ngb-time.ts";
import template from "@ngb/timepicker/ngb-timepicker.component.html";
import { NgbTimeAdapter } from "@ngb/timepicker/ngb-timepicker-adapter.service.ts";
import { NgbTimepickerConfig } from "@ngb/timepicker/ngb-timepicker-config.service.ts";
import { NgbTimepickerI18n } from "@ngb/timepicker/ngb-timepicker-i18n.ts";
import { isInteger, isNumber, padNumber, toInteger } from "@ngb/utils";
import {
  type AfterViewInit,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  forwardRef,
  Input,
  inject,
  type OnChanges,
  type SimpleChanges,
} from "ngjs-core";
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from "ngjs-core/forms";

const FILTER_REGEX = /[^0-9]/g;

/**
 * A directive that helps with picking hours, minutes and seconds.
 *
 * ngjs-core: `ControlValueAccessor` + `NG_VALUE_ACCESSOR` → el bridge lo conecta a
 * `ngModel` (upstream 1-1). El template sigue en AngularJS: los inputs usan
 * `ng-model` interno (`updateOn: 'change'`) en vez de `[value]`/`(change)`.
 */
@Component({
  exportAs: "ngbTimepicker",
  selector: "ngb-timepicker",
  controllerAs: "$",
  template,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NgbTimepicker), multi: true }],
})
export class NgbTimepicker implements ControlValueAccessor, OnChanges, AfterViewInit {
  static ngAcceptInputType_size: string;

  private readonly _config = inject(NgbTimepickerConfig);
  private readonly _ngbTimeAdapter = inject<NgbTimeAdapter<any>>(NgbTimeAdapter);
  private readonly _cd = inject(ChangeDetectorRef);
  private readonly _nativeElement = inject(ElementRef).nativeElement as HTMLElement;
  private readonly _destroyRef = inject(DestroyRef);

  readonly i18n = inject(NgbTimepickerI18n);

  disabled = this._config.disabled;
  model?: NgbTime;

  hourInput = "";
  minuteInput = "";
  secondInput = "";

  private _hourStep = this._config.hourStep;
  private _minuteStep = this._config.minuteStep;
  private _secondStep = this._config.secondStep;

  /**
   * Whether to display 12H or 24H mode.
   */
  @Input() meridian = this._config.meridian;

  /**
   * If `true`, the spinners above and below inputs are visible.
   */
  @Input() spinners = this._config.spinners;

  /**
   * If `true`, it is possible to select seconds.
   */
  @Input() seconds = this._config.seconds;

  /**
   * The number of hours to add/subtract when clicking hour spinners.
   */
  @Input()
  set hourStep(step: number) {
    this._hourStep = isInteger(step) ? step : this._config.hourStep;
  }

  get hourStep(): number {
    return this._hourStep;
  }

  /**
   * The number of minutes to add/subtract when clicking minute spinners.
   */
  @Input()
  set minuteStep(step: number) {
    this._minuteStep = isInteger(step) ? step : this._config.minuteStep;
  }

  get minuteStep(): number {
    return this._minuteStep;
  }

  /**
   * The number of seconds to add/subtract when clicking second spinners.
   */
  @Input()
  set secondStep(step: number) {
    this._secondStep = isInteger(step) ? step : this._config.secondStep;
  }

  get secondStep(): number {
    return this._secondStep;
  }

  /**
   * If `true`, the timepicker is readonly and can't be changed.
   */
  @Input() readonlyInputs = this._config.readonlyInputs;

  /**
   * The size of inputs and buttons.
   */
  @Input() size: "small" | "medium" | "large" = this._config.size;

  onChange = (_: any) => {};
  onTouched = () => {};

  ngAfterViewInit() {
    this._nativeElement.classList.add("d-inline-block", "fs-6");
    this._nativeElement.addEventListener("input", this._handleInputEvent);
    this._destroyRef.onDestroy(() => this._nativeElement.removeEventListener("input", this._handleInputEvent));
    this._renderInputValues();
  }

  writeValue(value: any) {
    const structValue = this._ngbTimeAdapter.fromModel(value);
    this.model = structValue ? new NgbTime(structValue.hour, structValue.minute, structValue.second) : new NgbTime();

    if (!this.seconds && (!structValue || !isNumber(structValue.second))) {
      this.model.second = 0;
    }

    this._renderInputValues();
    this._cd.markForCheck();
  }

  registerOnChange(fn: (value: any) => any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  /**
   * Increments the hours by the given step.
   */
  changeHour(step: number) {
    this.model?.changeHour(step);
    this._propagateModelChange();
  }

  /**
   * Increments the minutes by the given step.
   */
  changeMinute(step: number) {
    this.model?.changeMinute(step);
    this._propagateModelChange();
  }

  /**
   * Increments the seconds by the given step.
   */
  changeSecond(step: number) {
    this.model?.changeSecond(step);
    this._propagateModelChange();
  }

  /**
   * Update hours with the new value.
   */
  updateHour(newVal: string) {
    const isPM = this.model ? this.model.hour >= 12 : false;
    const enteredHour = toInteger(newVal);
    if (this.meridian && ((isPM && enteredHour < 12) || (!isPM && enteredHour === 12))) {
      this.model?.updateHour(enteredHour + 12);
    } else {
      this.model?.updateHour(enteredHour);
    }
    this._propagateModelChange();
  }

  /**
   * Update minutes with the new value.
   */
  updateMinute(newVal: string) {
    this.model?.updateMinute(toInteger(newVal));
    this._propagateModelChange();
  }

  /**
   * Update seconds with the new value.
   */
  updateSecond(newVal: string) {
    this.model?.updateSecond(toInteger(newVal));
    this._propagateModelChange();
  }

  toggleMeridian() {
    if (this.model && isNumber(this.model.hour) && this.meridian) {
      this.changeHour(12);
    }
  }

  formatInput(input: HTMLInputElement) {
    input.value = input.value.replace(FILTER_REGEX, "");
  }

  formatHour(value?: number) {
    if (!isNumber(value)) {
      return padNumber(NaN);
    }

    return this.meridian ? padNumber(value % 12 === 0 ? 12 : value % 12) : padNumber(value % 24);
  }

  formatMinSec(value?: number) {
    return padNumber(isNumber(value) ? value : NaN);
  }

  handleBlur() {
    this.onTouched();
  }

  get isSmallSize(): boolean {
    return this.size === "small";
  }

  get isLargeSize(): boolean {
    return this.size === "large";
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["seconds"] && !this.seconds && this.model && !isNumber(this.model.second)) {
      this.model.second = 0;
      this._propagateModelChange(false);
    }

    this._renderInputValues();
  }

  private _propagateModelChange(touched = true) {
    this._renderInputValues();

    if (touched) {
      this.onTouched();
    }

    if (this.model?.isValid(this.seconds)) {
      this.onChange(
        this._ngbTimeAdapter.toModel({
          hour: this.model.hour,
          minute: this.model.minute,
          second: this.model.second,
        }),
      );
    } else {
      this.onChange(this._ngbTimeAdapter.toModel(null));
    }
  }

  private _renderInputValues() {
    this.hourInput = this.formatHour(this.model?.hour);
    this.minuteInput = this.formatMinSec(this.model?.minute);
    this.secondInput = this.formatMinSec(this.model?.second);
  }

  private readonly _handleInputEvent = (event: Event) => {
    const input = event.target;

    if (input instanceof HTMLInputElement) {
      this.formatInput(input);
    }
  };
}
