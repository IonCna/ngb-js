import { NgbDate } from "@ngb/datepicker/ngb-date.ts";
import { isInteger } from "@ngb/utils";

export function fromJSDate(jsDate: Date) {
  return new NgbDate(jsDate.getFullYear(), jsDate.getMonth() + 1, jsDate.getDate());
}

export function toJSDate(date: NgbDate) {
  const jsDate = new Date(date.year, date.month - 1, date.day, 12);
  // this is done avoid 30 -> 1930 conversion
  if (!isNaN(jsDate.getTime())) {
    jsDate.setFullYear(date.year);
  }
  return jsDate;
}

export type NgbPeriod = "y" | "m" | "d";

export abstract class NgbCalendar {
  abstract getDaysPerWeek(): number;
  abstract getMonths(year?: number): number[];
  abstract getWeeksPerMonth(): number;
  abstract getWeekday(date: NgbDate): number;
  abstract getNext(date: NgbDate, period?: NgbPeriod, number?: number): NgbDate;
  abstract getPrev(date: NgbDate, period?: NgbPeriod, number?: number): NgbDate;
  abstract getWeekNumber(week: readonly NgbDate[], firstDayOfWeek: number): number;

  abstract isValid(date?: NgbDate | null): boolean;
  abstract getToday(): NgbDate;
}

export class NgbCalendarGregorian extends NgbCalendar {
  getDaysPerWeek() {
    return 7;
  }

  getMonths() {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  }

  getWeeksPerMonth() {
    return 6;
  }

  getNext(date: NgbDate, period: NgbPeriod = "d", number = 1) {
    const jsDate = toJSDate(date);
    let checkMonth = true;
    let expectedMonth = jsDate.getMonth();

    const cases: Record<NgbPeriod, Function> = {
      y: () => {
        jsDate.setFullYear(jsDate.getFullYear() + number);
      },
      m: () => {
        expectedMonth += number;
        jsDate.setMonth(expectedMonth);
        expectedMonth = expectedMonth % 12;

        if (expectedMonth < 0) {
          expectedMonth = expectedMonth + 12;
        }
      },
      d: () => {
        jsDate.setDate(jsDate.getDate() + number);
        checkMonth = false;
      },
    };

    const fn = cases[period];
    if (!fn) return date;

    fn();

    if (checkMonth && jsDate.getMonth() !== expectedMonth) {
      jsDate.setDate(0);
    }

    return fromJSDate(jsDate);
  }

  getPrev(date: NgbDate, period: NgbPeriod = "d", number = 1) {
    return this.getNext(date, period, -number);
  }

  getWeekday(date: NgbDate) {
    const jsDate = toJSDate(date);
    const day = jsDate.getDay();
    return day === 0 ? 7 : day;
  }

  getWeekNumber(week: readonly NgbDate[], firstDayOfWeek: number) {
    if (firstDayOfWeek === 7) {
      firstDayOfWeek = 0;
    }

    const thursdayIndex = (4 + 7 - firstDayOfWeek) % 7;
    const date = week[thursdayIndex];

    const jsDate = toJSDate(date);
    jsDate.setDate(jsDate.getDate() + 4 - (jsDate.getDay() || 7)); // Thursday
    const time = jsDate.getTime();
    jsDate.setMonth(0); // Compare with Jan 1
    jsDate.setDate(1);
    return Math.floor(Math.round((time - jsDate.getTime()) / 86400000) / 7) + 1;
  }

  getToday(): NgbDate {
    return fromJSDate(new Date());
  }

  isValid(date?: NgbDate | null): boolean {
    if (!date || !isInteger(date.year) || !isInteger(date.month) || !isInteger(date.day)) {
      return false;
    }

    // year 0 doesn't exist in Gregorian calendar
    if (date.year === 0) {
      return false;
    }

    const jsDate = toJSDate(date);

    return (
      !isNaN(jsDate.getTime()) &&
      jsDate.getFullYear() === date.year &&
      jsDate.getMonth() + 1 === date.month &&
      jsDate.getDate() === date.day
    );
  }
}
