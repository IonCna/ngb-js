import type { NgbDate } from "@ngb/datepicker/ngb-date.ts";
import { type NgbDatepickerI18n, NgbDatepickerI18nDefault } from "@ngb/datepicker/ngb-datepicker-i18n.service.ts";
import type {
  IAugmentedJQuery,
  IController,
  IDirective,
  IFilterService,
  ILocaleService,
  IOnChangesObject,
} from "angular";

export class NgbDatepickerDayView implements IController {
  public i18n?: NgbDatepickerI18n;
  public currentMonth!: number;
  public date!: NgbDate;
  public disabled!: boolean;
  public focused!: boolean;
  public selected!: boolean;

  constructor(
    private readonly $element: IAugmentedJQuery,
    private readonly $locale: ILocaleService,
    private readonly $filter: IFilterService,
  ) {}

  $onInit(): void {
    this.i18n = this.i18n ?? new NgbDatepickerI18nDefault(this.$locale, this.$filter);
    this.$element.addClass("btn btn-light border-0 p-0 text-center rounded-1");
    this.$element.css({ width: "2rem", height: "2rem", lineHeight: "2rem", background: "transparent" });
  }

  $postLink(): void {
    this._renderClasses();
  }

  $onChanges(_changes: IOnChangesObject): void {
    this._renderClasses();
  }

  isMuted(): boolean {
    return !this.selected && (this.date.month !== this.currentMonth || this.disabled);
  }

  private _renderClasses(): void {
    if (!this.date) return;
    this.$element.toggleClass("bg-primary", !!this.selected);
    this.$element.toggleClass("text-white", !!this.selected);
    this.$element.toggleClass("text-muted", this.isMuted());
    this.$element.toggleClass("outside", this.isMuted());
    this.$element.toggleClass("opacity-50", this.isMuted());
    this.$element.toggleClass("active", !!this.focused);
  }

  static get $name() {
    return "ngbDatepickerDayView";
  }

  static get $inject() {
    return ["$element", "$locale", "$filter"];
  }

  static $factory(): IDirective {
    return {
      bindToController: {
        currentMonth: "<",
        date: "<",
        disabled: "<",
        focused: "<",
        i18n: "<",
        selected: "<",
      },
      controller: NgbDatepickerDayView,
      controllerAs: "$day",
      restrict: "A",
      scope: true,
      template: "{{ $day.i18n && $day.i18n.getDayNumerals($day.date) }}",
    };
  }
}
