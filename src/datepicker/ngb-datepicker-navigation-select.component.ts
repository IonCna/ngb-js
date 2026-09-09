import { NgbDatepickerI18n } from "@ngb/datepicker/ngb-datepicker-i18n.service.ts";
import { NgbDate } from "@ngb/datepicker/ngb-date.ts";
import template from "@ngb/datepicker/ngb-datepicker-navigation-select.component.html";
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
  template,
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
