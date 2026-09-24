import { NgbDateAdapter, NGB_DATEPICKER_DATE_ADAPTER_FACTORY } from "@ngb/datepicker/adapters/ngb-date-adapter.ts";
import { NgbCalendar, NGB_DATEPICKER_CALENDAR_FACTORY } from "@ngb/datepicker/ngb-calendar.service.ts";
import {
  NGB_DATEPICKER_PARSER_FORMATTER_FACTORY,
  NgbDateParserFormatter,
} from "@ngb/datepicker/ngb-date-parser-formatter.ts";
import { NgbDatepicker } from "@ngb/datepicker/ngb-datepicker.component.ts";
import { NgbDatepickerContent } from "@ngb/datepicker/ngb-datepicker-content.component.ts";
import { NgbDatepickerDayView } from "@ngb/datepicker/ngb-datepicker-day-view.component.ts";
import { NgbDatepickerI18n, NgbDatepickerI18nDefault } from "@ngb/datepicker/ngb-datepicker-i18n.service.ts";
import { NgbDatepickerMonth } from "@ngb/datepicker/ngb-datepicker-month.component.ts";
import { NgbDatepickerNavigation } from "@ngb/datepicker/ngb-datepicker-navigation.component.ts";
import { NgbDatepickerNavigationSelect } from "@ngb/datepicker/ngb-datepicker-navigation-select.component.ts";
import { NgbInputDatepicker } from "@ngb/datepicker/ngb-input-datepicker.directive.ts";
import { NgModule } from "ngjs-core";
import { CommonModule } from "ngjs-core/common";

export { NgbDatepicker } from "@ngb/datepicker/ngb-datepicker.component.ts";
export { NgbDatepickerContent } from "@ngb/datepicker/ngb-datepicker-content.component.ts";
export { NgbInputDatepicker } from "@ngb/datepicker/ngb-input-datepicker.directive.ts";
export { NgbCalendar, type NgbPeriod, NgbCalendarGregorian } from "@ngb/datepicker/ngb-calendar.service.ts";
export { NgbDatepickerMonth } from "@ngb/datepicker/ngb-datepicker-month.component.ts";
export { NgbDatepickerDayView } from "@ngb/datepicker/ngb-datepicker-day-view.component.ts";
export { NgbDatepickerNavigation } from "@ngb/datepicker/ngb-datepicker-navigation.component.ts";
export { NgbDatepickerNavigationSelect } from "@ngb/datepicker/ngb-datepicker-navigation-select.component.ts";
export { NgbDatepickerConfig } from "@ngb/datepicker/ngb-datepicker-config.service.ts";
export { NgbInputDatepickerConfig } from "@ngb/datepicker/ngb-input-datepicker-config.service.ts";
export { NgbDatepickerI18n, NgbDatepickerI18nDefault } from "@ngb/datepicker/ngb-datepicker-i18n.service.ts";
export type { NgbDateStruct } from "@ngb/datepicker/ngb-date-struct.ts";
export { NgbDate } from "@ngb/datepicker/ngb-date.ts";
export { NgbDateAdapter, NgbDateStructAdapter } from "@ngb/datepicker/adapters/ngb-date-adapter.ts";
export { NgbDateParserFormatter } from "@ngb/datepicker/ngb-date-parser-formatter.ts";
export { NgbDatepickerKeyboardService } from "@ngb/datepicker/ngb-datepicker-keyboard.service.ts";
export type { DayTemplateContext } from "@ngb/datepicker/ngb-datepicker-day-template-context.ts";

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
  providers: [
    { provide: NgbCalendar, useFactory: NGB_DATEPICKER_CALENDAR_FACTORY },
    { provide: NgbDateAdapter, useFactory: NGB_DATEPICKER_DATE_ADAPTER_FACTORY },
    { provide: NgbDateParserFormatter, useFactory: NGB_DATEPICKER_PARSER_FORMATTER_FACTORY },
    { provide: NgbDatepickerI18n, useClass: NgbDatepickerI18nDefault },
  ],
})
export class NgbDatepickerModule {}
