import angular, {type IAugmentedJQuery, type IComponentController, type IComponentOptions, type ILogService} from "angular";
import template from "@ngb/timepicker/ngb-timepicker.component.html";
import {NgbTime} from "@ngb/timepicker/ngb-time.ts";
import {isInteger, isNumber, padNumber, toInteger} from "@ngb/utils";
import {NgbTimepickerConfig} from "@ngb/timepicker/ngb-timepicker-config.service";
import {ChangeDetectorRef} from "ngjs-core";
import {NgbTimeAdapter} from "@ngb/timepicker/ngb-timepicker-adapter.service.ts";
import {NgbTimepickerI18n} from "@ngb/timepicker/ngb-timepicker-i18n";
// import { NgbTime } from "@ngb/timepicker/ngb-time"
// import { isInteger } from "@ngb/utils";

const FILTER_REGEX = /[^0-9]/g;

export class NgbTimepicker implements IComponentController {
  static ngAcceptInputType_size: string

  disabled!: boolean
  model?: NgbTime;

  private _hourStep!: number
  private _minuteStep!: number
  private _secondStep!: number

  public meridian!: boolean
  public spinners!: boolean
  public seconds!: boolean
  public hourInput = ""
  public minuteInput = ""
  public secondInput = ""

  private ngModelCtrl?: angular.INgModelController

  set hourStep(value: number) {
    this._hourStep = isInteger(value) ? value : this._config.hourStep;
  }

  get hourStep() {
    return this._hourStep;
  }

  set minuteStep(step: number) {
    this._minuteStep = isInteger(step) ? step : this._config.minuteStep;
  }

  get minuteStep(): number {
    return this._minuteStep;
  }

  set secondStep(step: number) {
    this._secondStep = isInteger(step) ? step : this._config.secondStep;
  }

  get secondStep(): number {
    return this._secondStep;
  }

  public readonlyInputs!: boolean
  public size!: 'small' | 'medium' | 'large'

  constructor(
      private $element: IAugmentedJQuery,
      private _config: NgbTimepickerConfig,
      private _cd: ChangeDetectorRef,
      private _ngbTimeAdapter: NgbTimeAdapter<any>,
      public readonly i18n: NgbTimepickerI18n,
      private $log: ILogService,
  ) {}

  $onInit() {
    this.meridian = this.meridian ?? this._config.meridian
    this.spinners = this.spinners ?? this._config.spinners
    this.seconds = this.seconds ?? this._config.seconds;
    this.hourStep = this.hourStep ?? this._config.hourStep
    this.minuteStep = this.minuteStep ?? this._config.minuteStep
    this.secondStep = this.secondStep ?? this._config.secondStep
    this.disabled = this.disabled ?? this._config.disabled
    this.readonlyInputs = this.readonlyInputs ?? this._config.readonlyInputs
    this.size = this.size ?? this._config.size

    if(!this.ngModelCtrl) {
      this.$log.error("[ngbTimepicker] The ng-model attribute is required.")
      return
    }

    const ngModelCtrl = this.ngModelCtrl

    ngModelCtrl.$render = () => this.writeValue(ngModelCtrl.$viewValue)
    this.registerOnChange((value) => ngModelCtrl.$setViewValue(value))
    this.registerOnTouched(() => ngModelCtrl.$setTouched())
    ngModelCtrl.$render()
  }

  onChange = angular.noop
  onTouched = angular.noop

  $postLink() {
    this.$element.addClass("d-inline-block fs-6");
    this.$element.on("input", this.handleInputEvent)
    this.renderInputValues()
  }

  $onDestroy() {
    this.$element.off("input", this.handleInputEvent)
  }

  public writeValue(value: any) {
    const structValue = this._ngbTimeAdapter.fromModel(value);
    this.model = structValue ? new NgbTime(structValue.hour, structValue.minute, structValue.second) : new NgbTime();

    if(!this.seconds && (!structValue || !isNumber(structValue.second))) {
      this.model.second = 0
    }

    this.renderInputValues()
    this._cd.markForCheck();
  }

  registerOnChange(fn: (value: any) => any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => any) {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  changeHour(step: number) {
    this.model?.changeHour(step);
    this.propagateModelChange();
  }

  changeMinute(step: number) {
    this.model?.changeMinute(step);
    this.propagateModelChange();
  }

  changeSecond(step: number) {
    this.model?.changeSecond(step);
    this.propagateModelChange();
  }

  updateHour(newVal: string) {
    const isPM = this.model ? this.model.hour >= 12 : false;
    const enteredHour = toInteger(newVal);
    if (this.meridian && ((isPM && enteredHour < 12) || (!isPM && enteredHour === 12))) {
      this.model?.updateHour(enteredHour + 12);
    } else {
      this.model?.updateHour(enteredHour);
    }
    this.propagateModelChange();
  }

  updateMinute(newVal: string) {
    this.model?.updateMinute(toInteger(newVal));
    this.propagateModelChange();
  }

  updateSecond(newVal: string) {
    this.model?.updateSecond(toInteger(newVal));
    this.propagateModelChange();
  }

  toggleMeridian() {
    if (this.model && isNumber(this.model.hour) && this.meridian) {
      this.changeHour(12);
    }
  }

  formatInput(input: HTMLInputElement) {
    input.value = input.value.replace(FILTER_REGEX, '');
  }

  formatHour(value?: number) {
    if(!isNumber(value)) {
      return padNumber(NaN)
    }

    return this.meridian
        ? padNumber(value % 12 === 0 ? 12 : value % 12)
        : padNumber(value % 24)
  }

  formatMinSec(value?: number) {
    return padNumber(isNumber(value) ? value : NaN);
  }

  handleBlur() {
    this.onTouched();
  }

  get isSmallSize(): boolean {
    return this.size === 'small';
  }

  get isLargeSize(): boolean {
    return this.size === 'large';
  }

  $onChanges(onChangesObj: angular.IOnChangesObject) {
    if(onChangesObj["seconds"] && !this.seconds && this.model && !isNumber(this.model.second)) {
      this.model.second = 0
      this.propagateModelChange(false);
    }

    this.renderInputValues()
  }

  private propagateModelChange(touched = true) {
    this.renderInputValues()

    if(touched) {
      this.onTouched();
    }

    if(!this.model?.isValid(this.seconds)) {
      this.onChange(this._ngbTimeAdapter.toModel(null))
      return
    }

    this.onChange(
        this._ngbTimeAdapter.toModel({ hour: this.model.hour, minute: this.model.minute, second: this.model.second })
    )
  }

  private renderInputValues() {
    this.hourInput = this.formatHour(this.model?.hour)
    this.minuteInput = this.formatMinSec(this.model?.minute)
    this.secondInput = this.formatMinSec(this.model?.second)
  }

  private readonly handleInputEvent = (event: JQueryEventObject) => {
    const input = event.target

    if(input instanceof HTMLInputElement) {
      this.formatInput(input)
    }
  }

  static get $name() {
    return "ngbTimepicker";
  }

  static get $inject() {
    return [
      "$element",
      NgbTimepickerConfig.$name,
      ChangeDetectorRef.$name,
      NgbTimeAdapter.$name,
      NgbTimepickerI18n.$name,
      "$log",
    ];
  }

  static get $factory(): IComponentOptions {
    return {
      controller: NgbTimepicker,
      controllerAs: "$",
      require: {
        ngModelCtrl: "?ngModel",
      },
      bindings: {
        disabled: "<?ngDisabled",
        meridian: "<?",
        spinners: "<?",
        seconds: "<?",
        hourStep: "<?",
        minuteStep: "<?",
        secondStep: "<?",
        readonlyInputs: "<?",
        size: "<?",
      },
      template,
    };
  }
}
