import template from "@ngb/progressbar/ngb-progressbar.component.html";
import { NgbProgressbarConfig } from "@ngb/progressbar/ngb-progressbar-config.service";
import { NgbProgressbarStacked } from "@ngb/progressbar/ngb-progressbar-stacked.component";
import { getValueInRange, isNumber } from "@ngb/utils";
import { Component, HostBinding, inject, Input } from "ngjs-core";

@Component({
  selector: "ngb-progressbar",
  template,
})
export class NgbProgressbar {
  private _config = inject(NgbProgressbarConfig);
  public stacked = inject(NgbProgressbarStacked, { optional: true });
  private _max!: number;

  @Input()
  set max(max: number) {
    this._max = !isNumber(max) || max <= 0 ? 100 : max;
  }

  get max(): number {
    return this._max;
  }

  @Input() animated = this._config.animated;
  @Input() ariaLabel = this._config.ariaLabel;
  @Input() striped = this._config.striped;
  @Input() showValue = this._config.showValue;
  @Input() textType = this._config.textType;
  @Input() type = this._config.type;
  @Input({ required: true }) value = 0;
  @Input() height = this._config.height;

  @HostBinding("class.progress") readonly _progress = true;
  @HostBinding("attr.role") readonly _role = "progressbar";
  @HostBinding("attr.aria-valuemin") readonly _ariaValueMin = 0;

  @HostBinding("attr.aria-valuenow")
  get _ariaValueNow(): number {
    return this.getValue();
  }

  @HostBinding("attr.aria-valuemax")
  get _ariaValueMax(): number {
    return this.max;
  }

  @HostBinding("attr.aria-label")
  get _ariaLabel(): string {
    return this.ariaLabel;
  }

  @HostBinding("style.width")
  get _width(): string | null {
    return this.stacked ? `${this.getPercentValue()}%` : null;
  }

  @HostBinding("style.height")
  get _height(): string | undefined {
    return this.height;
  }

  constructor() {
    this.max = this._config.max;
  }

  getValue() {
    return getValueInRange(this.value, this.max);
  }

  getPercentValue() {
    return (100 * this.getValue()) / this.max;
  }
}
