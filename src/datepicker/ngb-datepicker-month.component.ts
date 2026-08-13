import type { NgbDateStruct } from "@ngb/datepicker/ngb-date-struct.ts";
import type { NgbDatepicker } from "@ngb/datepicker/ngb-datepicker.component.ts";
import template from "@ngb/datepicker/ngb-datepicker-month.component.html";
import type { DayViewModel, MonthViewModel } from "@ngb/datepicker/ngb-datepicker-view-model.ts";
import type { IAugmentedJQuery, IComponentController, IComponentOptions, IScope } from "angular";

export class NgbDatepickerMonth implements IComponentController {
  public datepicker?: NgbDatepicker;
  private _parentDatepicker?: NgbDatepicker;
  public viewModel!: MonthViewModel;

  private _month?: NgbDateStruct;

  constructor(
    private readonly $element: IAugmentedJQuery,
    private readonly $scope: IScope,
  ) {}

  set month(month: NgbDateStruct) {
    this._month = month;
    if (this.datepicker && month) this.viewModel = this.datepicker.getMonth(month);
  }

  get month(): NgbDateStruct | undefined {
    return this._month;
  }

  $onInit(): void {
    this.datepicker = this.datepicker ?? this._parentDatepicker ?? this._findDatepickerInTemplateScope();
    if (!this.datepicker) throw new Error("ngb-datepicker-month must be used inside an ngb-datepicker.");
    if (this._month) this.viewModel = this.datepicker.getMonth(this._month);
  }

  $postLink(): void {
    this.$element.addClass("d-block pe-auto");
    this.$element.attr("role", "grid");
    this.$element.on("keydown", this._handleKeyDown);
  }

  $onDestroy(): void {
    this.$element.off("keydown", this._handleKeyDown);
  }

  doSelect(day: DayViewModel): void {
    if (!day.context.disabled && !day.hidden) this.datepicker?.onDateSelect(day.date);
  }

  private readonly _handleKeyDown = (event: JQueryEventObject) => {
    this.datepicker?.processKey(event);
  };

  private _findDatepickerInTemplateScope(): NgbDatepicker | undefined {
    let scope: IScope | undefined = this.$scope.$parent;
    while (scope) {
      for (const key of Object.keys(scope)) {
        if (key.startsWith("$")) continue;
        const candidate = (scope as unknown as Record<string, unknown>)[key] as Partial<NgbDatepicker> | undefined;
        if (
          candidate &&
          typeof candidate === "object" &&
          typeof candidate.getMonth === "function" &&
          typeof candidate.onDateSelect === "function"
        ) {
          return candidate as NgbDatepicker;
        }
      }
      scope = scope.$parent;
    }
    return undefined;
  }

  static get $name() {
    return "ngbDatepickerMonth";
  }

  static get $inject() {
    return ["$element", "$scope"];
  }

  static get $factory(): IComponentOptions {
    return {
      bindings: {
        datepicker: "<?",
        month: "<",
      },
      controller: NgbDatepickerMonth,
      controllerAs: "$",
      require: {
        _parentDatepicker: "?^^ngbDatepicker",
      },
      template,
    };
  }
}
