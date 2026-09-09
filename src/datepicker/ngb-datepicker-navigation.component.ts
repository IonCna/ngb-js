import { NgbDate } from "@ngb/datepicker/ngb-date.ts";
import template from "@ngb/datepicker/ngb-datepicker-navigation.component.html";
import { NgbDatepickerI18n } from "@ngb/datepicker/ngb-datepicker-i18n.service.ts";
import { type MonthViewModel, NavigationEvent } from "@ngb/datepicker/ngb-datepicker-view-model.ts";
import { Component, EventEmitter, inject, Input, Output } from "ngjs-core";

@Component({
  selector: "ngb-datepicker-navigation",
  controllerAs: "$",
  template,
})
export class NgbDatepickerNavigation {
  navigation = NavigationEvent;

  i18n = inject(NgbDatepickerI18n);

  @Input() date!: NgbDate;
  @Input() disabled!: boolean;
  @Input() months: MonthViewModel[] = [];
  @Input() showSelect!: boolean;
  @Input() prevDisabled!: boolean;
  @Input() nextDisabled!: boolean;
  @Input() selectBoxes!: { years: number[]; months: number[] };

  @Output() navigate = new EventEmitter<NavigationEvent>();
  @Output() select = new EventEmitter<NgbDate>();

  onClickPrev(event: MouseEvent) {
    (event.currentTarget as HTMLElement).focus();
    this.navigate.emit(this.navigation.PREV);
  }

  onClickNext(event: MouseEvent) {
    (event.currentTarget as HTMLElement).focus();
    this.navigate.emit(this.navigation.NEXT);
  }

  idMonth(month: MonthViewModel) {
    return month;
  }
}
