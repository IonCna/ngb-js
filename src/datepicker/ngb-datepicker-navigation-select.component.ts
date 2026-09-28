import { NgbDatepickerI18n } from "@ngb/datepicker/ngb-datepicker-i18n.service.ts";
import { NgbDate } from "@ngb/datepicker/ngb-date.ts";
import { toInteger } from "@ngb/utils";
import { Component, EventEmitter, inject, Input, type OnChanges, type OnInit, Output } from "ngjs-core";

/**
 * 1-1 con ng-bootstrap `datepicker-navigation-select.ts`. Upstream sincroniza los
 * `<select>` por `@ViewChild` + `ngAfterViewChecked`; acá el template usa
 * `ng-model` sobre `selectedMonth` / `selectedYear` (equivalente AngularJS).
 */
@Component({
  selector: "ngb-datepicker-navigation-select",
  controllerAs: "$",
  template: `<select
  ng-disabled="$.disabled"
  ng-model="$.selectedMonth"
  ng-change="$.changeMonth($.selectedMonth)"
  class="form-select flex-grow-1 py-0 px-2 small"
  style="height: 1.85rem"
  i18n-aria-label="@@ngb.datepicker.select-month"
  aria-label="Select month"
  i18n-title="@@ngb.datepicker.select-month"
  title="Select month">
  <option
    ng-repeat="month in $.months track by month"
    ng-value="month"
    ng-attr-aria-label="{{ $.i18n.getMonthFullName(month, $.date.year) }}">
    {{ $.i18n.getMonthShortName(month, $.date.year) }}
  </option>
</select>
<select
  ng-disabled="$.disabled"
  ng-model="$.selectedYear"
  ng-change="$.changeYear($.selectedYear)"
  class="form-select flex-grow-1 py-0 px-2 small"
  style="height: 1.85rem"
  i18n-aria-label="@@ngb.datepicker.select-year"
  aria-label="Select year"
  i18n-title="@@ngb.datepicker.select-year"
  title="Select year">
  <option ng-repeat="year in $.years track by year" ng-value="year">
    {{ $.i18n.getYearNumerals(year) }}
  </option>
</select>`,
})
export class NgbDatepickerNavigationSelect implements OnInit, OnChanges {
  i18n = inject(NgbDatepickerI18n);

  @Input() date!: NgbDate;
  @Input() disabled!: boolean;
  @Input() months: number[] = [];
  @Input() years: number[] = [];

  @Output() select = new EventEmitter<NgbDate>();

  selectedMonth = 0;
  selectedYear = 0;

  ngOnInit(): void {
    this._syncSelection();
  }

  ngOnChanges(): void {
    this._syncSelection();
  }

  changeMonth(month: number | string): void {
    this.select.emit(new NgbDate(this.date.year, toInteger(month), 1));
  }

  changeYear(year: number | string): void {
    this.select.emit(new NgbDate(toInteger(year), this.date.month, 1));
  }

  private _syncSelection(): void {
    if (!this.date) return;
    this.selectedMonth = this.date.month;
    this.selectedYear = this.date.year;
  }
}
