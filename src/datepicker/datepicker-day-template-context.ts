import type { NgbDate } from "@ngb/datepicker/ngb-date";

export interface DayTemplateContext {
  $implicit: NgbDate;
  currentMonth: number;
  currentYear: number;
  data?: any;
  date: NgbDate;
  disabled: boolean;
  focused: boolean;
  selected: boolean;
  today: boolean;
}
