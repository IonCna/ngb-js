import type { NgbDateStruct } from "@ngb/datepicker/ngb-date-struct.ts";
import { NgbDatepickerI18n } from "@ngb/datepicker/ngb-datepicker-i18n.service.ts";

const WEEKDAYS = ["እሑድ", "ሰኞ", "ማክሰኞ", "ረቡዕ", "ሓሙስ", "ዓርብ", "ቅዳሜ"];
const MONTHS = ["መስከረም", "ጥቅምት", "ኅዳር", "ታህሣሥ", "ጥር", "የካቲት", "መጋቢት", "ሚያዝያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜ"];

/**
 * Amharic labels for the Ethiopian calendar.
 *
 * This is a regular class: consumers opt in with `new NgbDatepickerI18nAmharic()`.
 */
export class NgbDatepickerI18nAmharic extends NgbDatepickerI18n {
  getMonthShortName(month: number, year?: number): string {
    return this.getMonthFullName(month, year);
  }

  getMonthFullName(month: number, _year?: number): string {
    return MONTHS[month - 1] ?? "";
  }

  getWeekdayLabel(weekday: number): string {
    return WEEKDAYS[weekday - 1] ?? "";
  }

  getDayAriaLabel(date: NgbDateStruct): string {
    return `${date.day} ${this.getMonthFullName(date.month, date.year)} ${date.year}`;
  }
}
