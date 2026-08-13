import { hebrewNumerals, isHebrewLeapYear } from "@ngb/datepicker/hebrew/hebrew";
import type { NgbDateStruct } from "@ngb/datepicker/ngb-date-struct.ts";
import { NgbDatepickerI18n } from "@ngb/datepicker/ngb-datepicker-i18n.service.ts";

const WEEKDAYS = ["שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת", "ראשון"];
const MONTHS = ["תשרי", "חשון", "כסלו", "טבת", "שבט", "אדר", "ניסן", "אייר", "סיון", "תמוז", "אב", "אלול"];
const MONTHS_LEAP = [
  "תשרי",
  "חשון",
  "כסלו",
  "טבת",
  "שבט",
  "אדר א׳",
  "אדר ב׳",
  "ניסן",
  "אייר",
  "סיון",
  "תמוז",
  "אב",
  "אלול",
];

/**
 * Hebrew labels and numerals for the Hebrew calendar.
 *
 * This is a regular class: consumers opt in with `new NgbDatepickerI18nHebrew()`.
 */
export class NgbDatepickerI18nHebrew extends NgbDatepickerI18n {
  getMonthShortName(month: number, year?: number): string {
    return this.getMonthFullName(month, year);
  }

  getMonthFullName(month: number, year?: number): string {
    return isHebrewLeapYear(year) ? (MONTHS_LEAP[month - 1] ?? "") : (MONTHS[month - 1] ?? "");
  }

  getWeekdayLabel(weekday: number): string {
    return WEEKDAYS[weekday - 1] ?? "";
  }

  getDayAriaLabel(date: NgbDateStruct): string {
    return `${hebrewNumerals(date.day)} ${this.getMonthFullName(date.month, date.year)} ${hebrewNumerals(date.year)}`;
  }

  getDayNumerals(date: NgbDateStruct): string {
    return hebrewNumerals(date.day);
  }

  getWeekNumerals(weekNumber: number): string {
    return hebrewNumerals(weekNumber);
  }

  getYearNumerals(year: number): string {
    return hebrewNumerals(year);
  }
}
