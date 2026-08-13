import type { NgbDate } from "@ngb/datepicker/ngb-date.ts";

export interface NgbDateStruct {
  year: number;
  month: number;
  day: number;
}

export interface NgbDatepickerNavigateEvent {
  current: { year: number; month: number } | null;
  next: { year: number; month: number };
  preventDefault: () => void;
}

export interface NgbDatepickerState {
  readonly minDate: NgbDate | null;
  readonly maxDate: NgbDate | null;
  readonly firstDate: NgbDate;
  readonly lastDate: NgbDate;
  readonly focusedDate: NgbDate;
  readonly months: NgbDate[];
}
