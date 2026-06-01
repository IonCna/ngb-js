import type { NgbDate } from "@/datepicker/ngb-date";
import type { NgbDateStruct } from "@/datepicker/ngb-date-struct";
// import type {} from "@/datepicker/date"

export type NgbMarkDisabled = (date: NgbDateStruct, current?: { year: number; month: number }) => boolean;
export type NgbDayTemplateData = (date: NgbDateStruct, current?: { year: number; month: number }) => any;

export type DayViewModel = {
  date: NgbDate;
  context: DayTemplateContext;
  tabindex: number;
  ariaLabel: string;
  hidden: boolean;
};

export type WeekViewModel = {
  number: number;
  days: DayViewModel[];
  collapsed: boolean;
};

export type MonthViewModel = {
  firstDate: NgbDate;
  lastDate: NgbDate;
  number: number;
  year: number;
  weeks: WeekViewModel[];
  weekdays: string[];
};

export type DatepickerViewModel = {
  dayTemplateData: NgbDayTemplateData | null;
  disabled: boolean;
  displayMonths: number;
  firstDate: NgbDate | null;
  firstDayOfWeek: number;
  focusDate: NgbDate | null;
  focusVisible: boolean;
  lastDate: NgbDate | null;
  markDisabled: NgbMarkDisabled | null;
  maxDate: NgbDate | null;
  minDate: NgbDate | null;
  months: MonthViewModel[];
  navigation: "select" | "arrows" | "none";
  outsideDays: "visible" | "collapsed" | "hidden";
  prevDisabled: boolean;
  nextDisabled: boolean;
  selectBoxes: {
    years: number[];
    months: number[];
  };
  selectedDate: NgbDate | null;
  weekdayWidth: Exclude<Intl.DateTimeFormatOptions["weekday"], undefined>;
  weekdaysVisible: boolean;
};

export enum NavigationEvent {
  PREV,
  NEXT,
}
