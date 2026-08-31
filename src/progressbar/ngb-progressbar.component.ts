import template from "@ngb/progressbar/ngb-progressbar.component.html";
import { NgbProgressbarConfig } from "@ngb/progressbar/ngb-progressbar-config.service";
import type { NgbProgressbarStacked } from "@ngb/progressbar/ngb-progressbar-stacked.component";
import { getValueInRange } from "@ngb/utils";
import type { IAugmentedJQuery, IComponentController, IComponentOptions } from "angular";
import angular from "angular";

export class NgbProgressbar implements IComponentController {
  protected animated!: boolean;
  protected ariaLabel!: string;
  protected height!: string;
  protected _max?: number;
  protected showValue!: boolean;
  protected striped!: boolean;
  protected textType!: string;
  protected type!: string;
  protected value!: number;
  protected stacked?: NgbProgressbarStacked;

  constructor(
    private readonly ngbProgressbarConfig: NgbProgressbarConfig,
    private readonly $element: IAugmentedJQuery,
  ) {}

  $onInit(): void {
    this.animated = this.animated ?? this.ngbProgressbarConfig.animated;
    this.ariaLabel = this.ariaLabel ?? this.ngbProgressbarConfig.ariaLabel;
    this.height = this.height ?? this.ngbProgressbarConfig.height;
    this._max = this._max ?? this.ngbProgressbarConfig.max;
    this.showValue = this.showValue ?? this.ngbProgressbarConfig.showValue;
    this.striped = this.striped ?? this.ngbProgressbarConfig.striped;
    this.textType = this.textType ?? this.ngbProgressbarConfig.textType;
    this.type = this.type ?? this.ngbProgressbarConfig.type;

    this.value = this.value ?? 0;
  }

  $postLink(): void {
    this.$element.attr("role", "progressbar");
    this.$element.addClass("progress");
    this.$element.css({ height: this.height ?? "" });

    this.$element.attr("aria-valuemin", 0);
    this.$element.attr("aria-label", `${this.ariaLabel}`);
  }

  $onChanges(): void {
    this.$element.attr("aria-valuenow", this.getValue());
    this.$element.attr("aria-valuemax", this.max);

    if (this.stacked) {
      this.$element.css({ width: `${this.getPercentValue()}%` });
    }
  }

  set max(max: number) {
    this._max = !angular.isNumber(max) || max <= 0 ? 100 : max;
  }

  get max() {
    return this._max ?? this.ngbProgressbarConfig.max;
  }

  protected getValue() {
    return getValueInRange(this.value ?? 0, this.max ?? this.ngbProgressbarConfig.max);
  }

  protected getPercentValue() {
    return (100 * this.getValue()) / (this.max ?? this.ngbProgressbarConfig.max);
  }

  static get $name() {
    return "ngbProgressbar";
  }

  static get $inject() {
    return [NgbProgressbarConfig.$name, "$element"];
  }

  static get $factory(): IComponentOptions {
    return {
      bindings: {
        animated: "<?",
        ariaLabel: "@?",
        height: "@?",
        max: "<?",
        showValue: "<?",
        striped: "<?",
        textType: "@?",
        type: "@?",
        value: "<",
      },
      require: {
        stacked: "^?ngbProgressbarStacked",
      },
      transclude: true,
      controller: NgbProgressbar,
      controllerAs: "$",
      template,
    };
  }
}
