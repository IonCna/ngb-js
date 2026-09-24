import { NgbDatepicker } from "@ngb/datepicker/ngb-datepicker.component.ts";
import { NgbDatepickerContent } from "@ngb/datepicker/ngb-datepicker-content.component.ts";
import { NgbDatepickerDayView } from "@ngb/datepicker/ngb-datepicker-day-view.component.ts";
import { NgbDatepickerMonth } from "@ngb/datepicker/ngb-datepicker-month.component.ts";
import { NgbDatepickerNavigation } from "@ngb/datepicker/ngb-datepicker-navigation.component.ts";
import { NgbDatepickerNavigationSelect } from "@ngb/datepicker/ngb-datepicker-navigation-select.component.ts";
import { NgbInputDatepicker } from "@ngb/datepicker/ngb-input-datepicker.directive.ts";
import { NgModule } from "ngjs-core";
import { CommonModule } from "ngjs-core/common";

export { NgbDateAdapter, NgbDateStructAdapter } from "@ngb/datepicker/adapters/ngb-date-adapter.ts";
export { NgbCalendar, NgbCalendarGregorian, type NgbPeriod } from "@ngb/datepicker/ngb-calendar.service.ts";
export { NgbDate } from "@ngb/datepicker/ngb-date.ts";
export { NgbDateParserFormatter } from "@ngb/datepicker/ngb-date-parser-formatter.ts";
export type { NgbDateStruct } from "@ngb/datepicker/ngb-date-struct.ts";
export { NgbDatepicker } from "@ngb/datepicker/ngb-datepicker.component.ts";
export { NgbDatepickerConfig } from "@ngb/datepicker/ngb-datepicker-config.service.ts";
export { NgbDatepickerContent } from "@ngb/datepicker/ngb-datepicker-content.component.ts";
export type { DayTemplateContext } from "@ngb/datepicker/ngb-datepicker-day-template-context.ts";
export { NgbDatepickerDayView } from "@ngb/datepicker/ngb-datepicker-day-view.component.ts";
export { NgbDatepickerI18n, NgbDatepickerI18nDefault } from "@ngb/datepicker/ngb-datepicker-i18n.service.ts";
export { NgbDatepickerKeyboardService } from "@ngb/datepicker/ngb-datepicker-keyboard.service.ts";
export { NgbDatepickerMonth } from "@ngb/datepicker/ngb-datepicker-month.component.ts";
export { NgbDatepickerNavigation } from "@ngb/datepicker/ngb-datepicker-navigation.component.ts";
export { NgbDatepickerNavigationSelect } from "@ngb/datepicker/ngb-datepicker-navigation-select.component.ts";
export { NgbInputDatepicker } from "@ngb/datepicker/ngb-input-datepicker.directive.ts";
export { NgbInputDatepickerConfig } from "@ngb/datepicker/ngb-input-datepicker-config.service.ts";

@NgModule({
  controllerAs: "$",
  imports: [CommonModule],
  declarations: [
    NgbDatepicker,
    NgbDatepickerContent,
    NgbInputDatepicker,
    NgbDatepickerMonth,
    NgbDatepickerNavigation,
    NgbDatepickerNavigationSelect,
    NgbDatepickerDayView,
  ],
})
export class NgbDatepickerModule {}
