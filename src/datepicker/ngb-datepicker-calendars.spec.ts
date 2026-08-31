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
