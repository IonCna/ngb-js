import { NgbDate } from "@ngb/datepicker/ngb-date.ts";
import { type NgbDatepickerI18n, NgbDatepickerI18nDefault } from "@ngb/datepicker/ngb-datepicker-i18n.service.ts";
import template from "@ngb/datepicker/ngb-datepicker-navigation-select.component.html";
import { toInteger } from "@ngb/utils";
import type {
  IAugmentedJQuery,
  IComponentController,
  IComponentOptions,
  IFilterService,
  ILocaleService,
  IOnChangesObject,
} from "angular";

export class NgbDatepickerNavigationSelect implements IComponentController {
  public i18n?: NgbDatepickerI18n;
  public date!: NgbDate;
  public disabled!: boolean;
  public months: number[] = [];
  public years: number[] = [];
  public select?: (locals: { $event: NgbDate }) => void;

  public selectedMonth = 0;
  public selectedYear = 0;

  constructor(
    private readonly $element: IAugmentedJQuery,
    private readonly $locale: ILocaleService,
    private readonly $filter: IFilterService,
  ) {}

  $onInit(): void {
    this.i18n = this.i18n ?? new NgbDatepickerI18nDefault(this.$locale, this.$filter);
    this.$element.addClass("d-flex flex-grow-1");
    this.$element.css("flex-basis", "9rem");
    this._syncSelection();
  }

  $onChanges(_changes: IOnChangesObject): void {
    this._syncSelection();
  }

  changeMonth(month: number | string): void {
    this.select?.({ $event: new NgbDate(this.date.year, toInteger(month), 1) });
  }

  changeYear(year: number | string): void {
    this.select?.({ $event: new NgbDate(toInteger(year), this.date.month, 1) });
  }

  private _syncSelection(): void {
    if (!this.date) return;
    this.selectedMonth = this.date.month;
    this.selectedYear = this.date.year;
  }

  static get $name() {
    return "ngbDatepickerNavigationSelect";
  }

  static get $inject() {
    return ["$element", "$locale", "$filter"];
  }

  static get $factory(): IComponentOptions {
    return {
      bindings: {
        date: "<",
        disabled: "<",
        i18n: "<?",
        months: "<",
        years: "<",
        select: "&?",
      },
      controller: NgbDatepickerNavigationSelect,
      controllerAs: "$",
      template,
    };
  }
}
