import template from "@ngb/rating/ngb-rating.component.html";
import { NgbRatingConfig } from "@ngb/rating/ngb-rating-config.service";
import { getValueInRange } from "@ngb/utils";
import type { IAugmentedJQuery, IComponentController, IComponentOptions, IOnChangesObject, IScope } from "angular";
import { ContentChild, TemplateRef, ViewChild } from "ngjs-core";

export interface StarTemplateContext {
  fill: number;
  index: number;
}

export class NgbRating implements IComponentController {
  protected disabled!: boolean;
  protected _max?: number;
  protected rate!: number;
  protected readonly!: boolean;
  protected resettable!: boolean;
  protected tabindex!: number | string;

  protected rateChange?: (locals: { $event: number }) => void;
  protected hover?: (locals: { $event: number }) => void;
  protected leave?: (locals: { $event: number }) => void;

  public starTemplate?: TemplateRef<StarTemplateContext>;

  @ContentChild(TemplateRef, { static: false })
  public starTemplateFromContent?: TemplateRef<StarTemplateContext>;

  @ViewChild("defaultStar", { read: TemplateRef, static: true })
  public defaultStarTemplate!: TemplateRef<StarTemplateContext>;

  protected contexts: StarTemplateContext[] = [];
  protected nextRate!: number;

  constructor(
    private readonly $element: IAugmentedJQuery,
    private readonly $scope: IScope,
    private readonly ngbRatingConfig: NgbRatingConfig,
  ) {}

  $onInit(): void {
    this.disabled = this.disabled ?? false;
    this.readonly = this.readonly ?? this.ngbRatingConfig.readonly;
    this.resettable = this.resettable ?? this.ngbRatingConfig.resettable;
    this.tabindex = this.tabindex ?? this.ngbRatingConfig.tabindex;
    this.rate = this.rate ?? 0;

    this._setupContexts();
    this.update(this.rate);
  }

  $postLink(): void {
    this.$element.addClass("d-inline-flex");
    this.$element.attr("role", "slider");
    this.$element.attr("aria-valuemin", "0");

    this.$element.on("blur", () => this.$scope.$evalAsync());
    this.$element.on("keydown", (event) => this.$scope.$evalAsync(() => this._handleKeyDown(event)));
    this.$element.on("mouseleave", () => this.$scope.$evalAsync(() => this.reset()));
  }

  $onDestroy(): void {
    this.$element.off("blur");
    this.$element.off("keydown");
    this.$element.off("mouseleave");
  }

  $onChanges(changes: IOnChangesObject): void {
    if ("rate" in changes) this.update(this.rate);
    if ("max" in changes && !changes["max"].isFirstChange()) this._updateMax();

    this._render();
  }

  set max(max: number) {
    this._max = max;
  }

  get max(): number {
    return this._max ?? this.ngbRatingConfig.max;
  }

  public ariaValueText(current: number, max: number): string {
    return `${current} out of ${max}`;
  }

  isInteractive(): boolean {
    return !this.readonly && !this.disabled;
  }

  enter(value: number): void {
    if (this.isInteractive()) this._updateState(value);
    this.hover?.({ $event: value });
  }

  handleClick(value: number): void {
    if (!this.isInteractive()) return;
    this.update(this.resettable && this.rate === value ? 0 : value);
  }

  reset(): void {
    this.leave?.({ $event: this.nextRate });
    this._updateState(this.rate);
  }

  update(value: number): void {
    const newRate = getValueInRange(value, this.max, 0);
    if (this.isInteractive() && this.rate !== newRate) {
      this.rate = newRate;
      this.rateChange?.({ $event: this.rate });
    }
    this._updateState(this.rate);
  }

  private _handleKeyDown(event: JQueryEventObject): void {
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

  private _updateState(nextValue: number): void {
    this.nextRate = nextValue;
    this.contexts = this.contexts.map((context, index) => ({
      ...context,
      fill: Math.round(getValueInRange(nextValue - index, 1, 0) * 100),
    }));
    this._render();
  }

  private _render(): void {
    this.$element.attr("tabindex", this.disabled ? "-1" : `${this.tabindex ?? this.ngbRatingConfig.tabindex}`);
    this.$element.attr("aria-valuemax", `${this.max}`);
    this.$element.attr("aria-valuenow", `${this.nextRate}`);
    this.$element.attr("aria-valuetext", this.ariaValueText(this.nextRate, this.max));

    if (this.readonly && !this.disabled) this.$element.attr("aria-readonly", "true");
    else this.$element.removeAttr("aria-readonly");

    if (this.disabled) this.$element.attr("aria-disabled", "true");
    else this.$element.removeAttr("aria-disabled");
  }

  private _updateMax(): void {
    if (this.max > 0) {
      this._setupContexts();
      this.update(this.rate);
    }
  }

  private _setupContexts(): void {
    this.contexts = Array.from({ length: this.max }, (_, index) => ({ fill: 0, index }));
  }

  static get $name() {
    return "ngbRating";
  }

  static get $inject() {
    return ["$element", "$scope", NgbRatingConfig.$name];
  }

  static get $factory(): IComponentOptions {
    return {
      bindings: {
        disabled: "<?",
        max: "<?",
        rate: "<?",
        rateChange: "&?",
        readonly: "<?",
        resettable: "<?",
        starTemplate: "<?",
        tabindex: "<?",
        ariaValueText: "<?",
        hover: "&?",
        leave: "&?",
      },
      controller: NgbRating,
      controllerAs: "$",
      transclude: true,
      template,
    };
  }
}
