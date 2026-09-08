import template from "@ngb/rating/ngb-rating.component.html";
import { NgbRatingConfig } from "@ngb/rating/ngb-rating-config.service";
import { getValueInRange } from "@ngb/utils";
import {
  ChangeDetectorRef,
  Component,
  ContentChild,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  inject,
  type OnChanges,
  type OnInit,
  Output,
  type SimpleChanges,
  TemplateRef,
  ViewChild,
} from "ngjs-core";

export interface StarTemplateContext {
  fill: number;
  index: number;
}

@Component({
  selector: "ngb-rating",
  template,
  transclude: true,
})
export class NgbRating implements OnInit, OnChanges {
  contexts: StarTemplateContext[] = [];
  nextRate!: number;

  private _config = inject(NgbRatingConfig);
  private _changeDetectorRef = inject(ChangeDetectorRef);

  @Input() disabled = false;
  @Input() max = this._config.max;
  @Input() rate!: number;
  @Input() readonly = this._config.readonly;
  @Input() resettable = this._config.resettable;
  @Input() starTemplate?: TemplateRef<StarTemplateContext>;

  @ContentChild(TemplateRef, { static: false })
  starTemplateFromContent?: TemplateRef<StarTemplateContext>;

  @ViewChild("defaultStar", { read: TemplateRef, static: true })
  defaultStarTemplate!: TemplateRef<StarTemplateContext>;

  @Input() tabindex: number | string = this._config.tabindex;

  @Input() ariaValueText(current: number, max: number): string {
    return `${current} out of ${max}`;
  }

  @Output() hover = new EventEmitter<number>();
  @Output() leave = new EventEmitter<number>();
  @Output() rateChange = new EventEmitter<number>();

  onChange = (_: any) => {};
  onTouched = () => {};

  @HostBinding("class.d-inline-flex")
  readonly _dInlineFlex = true;

  @HostBinding("attr.tabindex")
  get _tabindex(): number | string {
    return this.disabled ? -1 : this.tabindex;
  }

  @HostBinding("attr.role")
  readonly _role = "slider";

  @HostBinding("attr.aria-valuemin")
  readonly _ariaValueMin = "0";

  @HostBinding("attr.aria-valuemax")
  get _ariaValueMax(): number {
    return this.max;
  }

  @HostBinding("attr.aria-valuenow")
  get _ariaValueNow(): number {
    return this.nextRate;
  }

  @HostBinding("attr.aria-valuetext")
  get _ariaValueText(): string {
    return this.ariaValueText(this.nextRate, this.max);
  }

  @HostBinding("attr.aria-readonly")
  get _ariaReadonly(): true | null {
    return this.readonly && !this.disabled ? true : null;
  }

  @HostBinding("attr.aria-disabled")
  get _ariaDisabled(): true | null {
    return this.disabled ? true : null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["rate"]) {
      this.update(this.rate);
    }
    if (changes["max"]) {
      this._updateMax();
    }
  }

  ngOnInit(): void {
    this._setupContexts();
    this._updateState(this.rate);
  }

  registerOnChange(fn: (value: any) => any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  isInteractive(): boolean {
    return !this.readonly && !this.disabled;
  }

  enter(value: number): void {
    if (this.isInteractive()) {
      this._updateState(value);
    }
    this.hover.emit(value);
  }

  @HostListener("blur")
  handleBlur(): void {
    this.onTouched();
  }

  handleClick(value: number): void {
    if (this.isInteractive()) {
      this.update(this.resettable && this.rate === value ? 0 : value);
    }
  }

  @HostListener("keydown", ["$event"])
  handleKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowLeft":
        this.update(this.rate - 1);
        break;
      case "ArrowUp":
      case "ArrowRight":
        this.update(this.rate + 1);
        break;
      case "Home":
        this.update(0);
        break;
      case "End":
        this.update(this.max);
        break;
      default:
        return;
    }

    event.preventDefault();
  }

  @HostListener("mouseleave")
  reset(): void {
    this.leave.emit(this.nextRate);
    this._updateState(this.rate);
  }

  update(value: number, internalChange = true): void {
    const newRate = getValueInRange(value, this.max, 0);
    if (this.isInteractive() && this.rate !== newRate) {
      this.rate = newRate;
      this.rateChange.emit(this.rate);
    }
    if (internalChange) {
      this.onChange(this.rate);
      this.onTouched();
    }
    this._updateState(this.rate);
  }

  writeValue(value: number): void {
    this.update(value, false);
    this._changeDetectorRef.markForCheck();
  }

  private _updateState(nextValue: number): void {
    this.nextRate = nextValue;
    this.contexts.forEach(
      (context, index) => (context.fill = Math.round(getValueInRange(nextValue - index, 1, 0) * 100)),
    );
  }

  private _updateMax(): void {
    if (this.max > 0) {
      this._setupContexts();
      this.update(this.rate);
    }
  }

  private _setupContexts(): void {
    this.contexts = Array.from({ length: this.max }, (_value, index) => ({ fill: 0, index }));
  }
}
