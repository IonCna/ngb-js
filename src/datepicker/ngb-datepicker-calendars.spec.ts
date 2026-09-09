import { NgbCalendarBuddhist } from "@ngb/datepicker/buddhist/ngb-calendar-buddhist.ts";
import { NgbDatepickerI18nAmharic } from "@ngb/datepicker/ethiopian/datepicker-i18n-amharic.ts";
import { NgbCalendarEthiopian } from "@ngb/datepicker/ethiopian/ngb-calendar-ethiopian.ts";
import { NgbDatepickerI18nHebrew } from "@ngb/datepicker/hebrew/datepicker-i18n-hebrew.ts";
import { NgbCalendarHebrew } from "@ngb/datepicker/hebrew/ngb-calendar-hebrew.ts";
import { NgbCalendarIslamicCivil } from "@ngb/datepicker/hijri/ngb-calendar-islamic-civil.ts";
import { NgbCalendarIslamicUmalqura } from "@ngb/datepicker/hijri/ngb-calendar-islamic-umalqura.ts";
import { NgbCalendarPersian } from "@ngb/datepicker/jalali/ngb-calendar-persian.ts";
import type { NgbCalendar } from "@ngb/datepicker/ngb-calendar.service.ts";
import { NgbDate } from "@ngb/datepicker/ngb-date.ts";
import { describe, expect, it } from "vitest";

const calendars: Array<[string, NgbCalendar]> = [
  ["Buddhist", new NgbCalendarBuddhist()],
  ["Ethiopian", new NgbCalendarEthiopian()],
  ["Persian", new NgbCalendarPersian()],
  ["Hebrew", new NgbCalendarHebrew()],
  ["Islamic Civil", new NgbCalendarIslamicCivil()],
  ["Islamic Umm al-Qura", new NgbCalendarIslamicUmalqura()],
];

describe.each(calendars)("%s calendar", (_name, calendar) => {
  it("provides a valid today and reversible day navigation", () => {
    const today = calendar.getToday();
    expect(calendar.isValid(today)).toBe(true);
    expect(calendar.getPrev(calendar.getNext(today))).toEqual(today);
    expect(calendar.getDaysPerWeek()).toBe(7);
    expect(calendar.getMonths(today.year).length).toBeGreaterThanOrEqual(12);
  });

  it("returns valid weekdays and month boundaries", () => {
    const today = calendar.getToday();
    const first = new NgbDate(today.year, today.month, 1);
    expect(calendar.getWeekday(first)).toBeGreaterThanOrEqual(1);
    expect(calendar.getWeekday(first)).toBeLessThanOrEqual(7);
    expect(calendar.getNext(calendar.getPrev(first, "m"), "m")).toEqual(first);
  });

  it("navigates reversibly by month and year", () => {
    const today = calendar.getToday();
    const date = new NgbDate(today.year, today.month, 1);
    // `getNext('m')` fija `day = 1`; con `date` ya en day 1 el roundtrip es exacto.
    expect(calendar.getPrev(calendar.getNext(date, "m"), "m")).toEqual(date);
    // `getNext('y')` en calendarios no gregorianos salta a `{year, 1, 1}` (igual que
    // ng-bootstrap) — el roundtrip sólo garantiza volver al mismo año.
    expect(calendar.getPrev(calendar.getNext(date, "y"), "y").year).toBe(date.year);
  });

  it("validates every advertised month", () => {
    const today = calendar.getToday();
    for (const month of calendar.getMonths(today.year)) {
      expect(calendar.isValid(new NgbDate(today.year, month, 1))).toBe(true);
    }
    // Nota: el `isValid` de los calendarios hijri/jalali de ng-bootstrap es laxo
    // (sólo `isNumber` + `!isNaN(toGregorian)`), así que mes/día 0 NO se rechazan
    // en todos los calendarios — no se asume acá.
  });
});

describe("calendar-specific i18n", () => {
  it("provides Amharic labels", () => {
    const i18n = new NgbDatepickerI18nAmharic();
    expect(i18n.getMonthFullName(1)).toBe("መስከረም");
    expect(i18n.getDayAriaLabel(new NgbDate(2019, 1, 1))).toContain("መስከረም");
  });

  it("provides Hebrew labels and numerals", () => {
    const i18n = new NgbDatepickerI18nHebrew();
    expect(i18n.getMonthFullName(1, 5786)).toBe("תשרי");
    expect(i18n.getDayNumerals(new NgbDate(5786, 1, 1))).not.toBe("1");
  });
});
