import type { IAugmentedJQuery, IComponentController, IComponentOptions } from "angular";
import type { NgbDate } from "@/datepicker/ngb-date";
import { NgDisabled } from "ngjs-core";

export class NgbDatepickerDayView implements IComponentController {
  protected currentMonth?: number;
  protected date?: NgbDate;
  protected ngDisabled?: NgDisabled;
  protected focused?: number;
  protected selected?: number;
  private removeDisabledListener?: () => void;

  constructor(private $element: IAugmentedJQuery) {}

  $postLink(): void {
    this.$element.addClass("btn-light");
    this.removeDisabledListener = this.ngDisabled?.onChange(() => this._render());
    this._render();
  }

  $onChanges(): void {
    this._render();
  }

  $onDestroy(): void {
    this.removeDisabledListener?.();
  }

  private _render(): void {
    this.$element.toggleClass("bg-primary", Boolean(this.selected));
    this.$element.toggleClass("text-white", Boolean(this.selected));
    this.$element.toggleClass("text-muted", this.isMuted());
    this.$element.toggleClass("outside", this.isMuted());
    this.$element.toggleClass("active", Boolean(this.focused));
  }

  public isMuted() {
    return Boolean(!this.selected && (this.date?.month !== this.currentMonth || this.ngDisabled?.disabled));
  }

  static get $name() {
    return "ngbDatepickerDayView";
  }

  static get $factory(): IComponentOptions {
    return {
      controller: NgbDatepickerDayView,
      controllerAs: "$",
      require: {
        currentMonth: "<?",
        date: "<?",
        ngDisabled: "?ngDisabled",
        focused: "<?",
        selected: "<?",
      },
    };
  }

  static get $inject() {
    return ["$element"];
  }
}
