import type { NgbDate } from "@ngb/datepicker/ngb-date.ts";
import { type NgbDatepickerI18n, NgbDatepickerI18nDefault } from "@ngb/datepicker/ngb-datepicker-i18n.service.ts";
import template from "@ngb/datepicker/ngb-datepicker-navigation.component.html";
import { type MonthViewModel, NavigationEvent } from "@ngb/datepicker/ngb-datepicker-view-model.ts";
import type {
  IAugmentedJQuery,
  IComponentController,
  IComponentOptions,
  IFilterService,
  ILocaleService,
} from "angular";

export class NgbDatepickerNavigation implements IComponentController {
  public readonly navigation = NavigationEvent;
  public i18n?: NgbDatepickerI18n;
  public date!: NgbDate;
  public disabled!: boolean;
  public months: MonthViewModel[] = [];
  public showSelect!: boolean;
  public prevDisabled!: boolean;
  public nextDisabled!: boolean;
  public selectBoxes!: { years: number[]; months: number[] };
  public navigate?: (locals: { $event: NavigationEvent }) => void;
  public select?: (locals: { $event: NgbDate }) => void;

  constructor(
    private readonly $element: IAugmentedJQuery,
    private readonly $locale: ILocaleService,
    private readonly $filter: IFilterService,
  ) {}

  $onInit(): void {
    this.i18n = this.i18n ?? new NgbDatepickerI18nDefault(this.$locale, this.$filter);
    this.$element.addClass("d-flex align-items-center");
  }

  onClickPrev(event: MouseEvent): void {
    (event.currentTarget as HTMLElement | null)?.focus();
    this.navigate?.({ $event: NavigationEvent.PREV });
  }

  onClickNext(event: MouseEvent): void {
    (event.currentTarget as HTMLElement | null)?.focus();
    this.navigate?.({ $event: NavigationEvent.NEXT });
  }

  static get $name() {
    return "ngbDatepickerNavigation";
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
        showSelect: "<",
        prevDisabled: "<",
        nextDisabled: "<",
        selectBoxes: "<",
        navigate: "&?",
        select: "&?",
      },
      controller: NgbDatepickerNavigation,
      controllerAs: "$",
      template,
    };
  }
}
