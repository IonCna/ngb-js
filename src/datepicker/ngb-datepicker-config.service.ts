import type { NgbDateStruct } from "@ngb/datepicker/ngb-date-struct.ts";
import type { DayTemplateContext } from "@ngb/datepicker/ngb-datepicker-day-template-context.ts";
import type { TemplateRef } from "ngjs-core";

export class NgbDatepickerConfig {
  dayTemplate?: TemplateRef<DayTemplateContext>;
  dayTemplateData?: (date: NgbDateStruct, current?: { year: number; month: number }) => any;
  footerTemplate?: TemplateRef<any>;
  displayMonths = 1;
  firstDayOfWeek = 1;
  markDisabled?: (date: NgbDateStruct, current?: { year: number; month: number }) => boolean;
  minDate?: NgbDateStruct;
  maxDate?: NgbDateStruct;
  navigation: "select" | "arrows" | "none" = "select";
  outsideDays: "visible" | "collapsed" | "hidden" = "visible";
  showWeekNumbers = false;
  startDate?: { year: number; month: number; day?: number };
  weekdays: Exclude<Intl.DateTimeFormatOptions["weekday"], undefined> | boolean = "narrow";

  static get $name() {
    return "ngb.datepicker-config.service";
  }
}
