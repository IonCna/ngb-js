import { NgbDateStructAdapter } from "@ngb/datepicker/adapters/ngb-date-adapter.ts";
import { NgbDateNativeAdapter } from "@ngb/datepicker/adapters/ngb-date-native-adapter.ts";
import { NgbDateNativeUTCAdapter } from "@ngb/datepicker/adapters/ngb-date-native-utc-adapter.ts";
import { NgbCalendarGregorian } from "@ngb/datepicker/ngb-calendar.service.ts";
import { NgbDate } from "@ngb/datepicker/ngb-date.ts";
import { NgbDateISOParserFormatter } from "@ngb/datepicker/ngb-date-parser-formatter.ts";
import { NgbDatepickerModule } from "@ngb/datepicker/ngb-datepicker.module.ts";
import { NgbDatepickerService } from "@ngb/datepicker/ngb-datepicker.service.ts";
import { NgbDatepickerI18nDefault } from "@ngb/datepicker/ngb-datepicker-i18n.service.ts";
import {
  generateSelectBoxMonths,
  generateSelectBoxYears,
  getFirstViewDate,
  isChangedDate,
} from "@ngb/datepicker/ngb-datepicker-tools.ts";
import type { IFilterService, ILocaleService } from "angular";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configureTestBed, type NgbTestBed } from "../../test/testbed.ts";

describe("datepicker core", () => {
  it("compares and orders NgbDate values", () => {
    const date = new NgbDate(2026, 8, 13);
    expect(NgbDate.from(date)).toBe(date);
    expect(date.equals({ year: 2026, month: 8, day: 13 })).toBe(true);
    expect(date.before({ year: 2026, month: 8, day: 14 })).toBe(true);
    expect(date.after({ year: 2026, month: 8, day: 12 })).toBe(true);
    expect(isChangedDate(date, new NgbDate(2026, 8, 13))).toBe(false);
  });

  it("converts struct, native and UTC date models", () => {
    const struct = { year: 2026, month: 8, day: 13 };
    expect(new NgbDateStructAdapter().toModel(struct)).toEqual(struct);

    const native = new NgbDateNativeAdapter().toModel(struct);
    expect(native?.getFullYear()).toBe(2026);
    expect(new NgbDateNativeAdapter().fromModel(native)).toEqual(struct);

    const utc = new NgbDateNativeUTCAdapter().toModel(struct);
    expect(utc?.getUTCFullYear()).toBe(2026);
    expect(new NgbDateNativeUTCAdapter().fromModel(utc)).toEqual(struct);
  });

  it("parses and formats ISO dates", () => {
    const formatter = new NgbDateISOParserFormatter();
    expect(formatter.parse("2026-08-13")).toEqual({ year: 2026, month: 8, day: 13 });
    expect(formatter.format({ year: 2026, month: 8, day: 13 })).toBe("2026-08-13");
    expect(formatter.parse("invalid")).toBeNull();
  });

  it("navigates and validates Gregorian dates", () => {
    const calendar = new NgbCalendarGregorian();
    const leapDay = new NgbDate(2024, 2, 29);
    expect(calendar.isValid(leapDay)).toBe(true);
    expect(calendar.isValid(new NgbDate(2023, 2, 29))).toBe(false);
    expect(calendar.getNext(leapDay)).toEqual(new NgbDate(2024, 3, 1));
    expect(calendar.getPrev(new NgbDate(2026, 1, 1))).toEqual(new NgbDate(2025, 12, 31));
    expect(calendar.getWeekday(new NgbDate(2026, 8, 13))).toBe(4);
  });

  it("generates constrained navigation options", () => {
    const calendar = new NgbCalendarGregorian();
    const date = new NgbDate(2026, 8, 1);
    expect(generateSelectBoxMonths(calendar, date, new NgbDate(2026, 6, 1), new NgbDate(2026, 10, 1))).toEqual([
      6, 7, 8, 9, 10,
    ]);
    expect(generateSelectBoxYears(date, new NgbDate(2024, 1, 1), new NgbDate(2028, 1, 1))).toEqual([
      2024, 2025, 2026, 2027, 2028,
    ]);
    expect(getFirstViewDate(calendar, date, 1)).toEqual(new NgbDate(2026, 7, 27));
  });

  it("uses the same Intl locale calculations as the original i18n service", () => {
    const locale = { id: "es-MX" } as ILocaleService;
    const i18n = new NgbDatepickerI18nDefault(locale, ((name: string) => {
      if (name === "date") return () => "";
      throw new Error(`Unexpected filter ${name}`);
    }) as IFilterService);
    const expectedWeekday = Intl.DateTimeFormat("es-MX", { weekday: "narrow", timeZone: "UTC" }).format(
      Date.UTC(2000, 4, 3),
    );
    expect(i18n.getWeekdayLabel(3)).toBe(expectedWeekday);
    expect(i18n.getMonthFullName(8)).toBe(
      Intl.DateTimeFormat("es-MX", { month: "long", timeZone: "UTC" }).format(Date.UTC(2000, 7)),
    );
  });
});

describe("NgbDatepickerService", () => {
  let tb: NgbTestBed;

  beforeEach(async () => {
    // Bootstrapea `NgbDatepickerModule` → `NgbCalendar` / `NgbDatepickerI18n`
    // quedan resolubles vía `InjectorImpl.current`, así que `new
    // NgbDatepickerService()` (que usa `inject()` en fields, como upstream) anda.
    tb = await configureTestBed(NgbDatepickerModule);
  });

  afterEach(() => tb.destroy());

  it("opens, focuses and emits selectable dates without UI", () => {
    const service = new NgbDatepickerService();
    const models = vi.fn();
    const selections = vi.fn();
    service.model$.subscribe(models);
    service.dateSelect$.subscribe(selections);

    service.set({ minDate: new NgbDate(2026, 8, 1), maxDate: new NgbDate(2026, 8, 31) });
    service.open(new NgbDate(2026, 8, 13));
    service.focus(new NgbDate(2026, 8, 20));
    service.focusSelect();

    expect(models).toHaveBeenCalled();
    expect(selections).toHaveBeenCalledWith(new NgbDate(2026, 8, 20));
    expect(service.getMonth({ year: 2026, month: 8, day: 1 }).weeks).toHaveLength(6);
  });

  it("normalizes valid and invalid dates", () => {
    const service = new NgbDatepickerService();
    const fallback = new NgbDate(2026, 1, 1);
    expect(service.toValidDate({ year: 2024, month: 2, day: 29 })).toEqual(new NgbDate(2024, 2, 29));
    expect(service.toValidDate({ year: 2023, month: 2, day: 29 }, fallback)).toBe(fallback);
    expect(service.toValidDate(null, null)).toBeNull();
  });

  it("ignores invalid display and weekday options", () => {
    const service = new NgbDatepickerService();
    const models = vi.fn();
    service.model$.subscribe(models);
    service.open(new NgbDate(2026, 8, 1));
    service.set({ displayMonths: 0, firstDayOfWeek: -1 });
    expect(models.mock.lastCall?.[0]).toMatchObject({ displayMonths: 1, firstDayOfWeek: 1 });
  });

  it("prevents focus, navigation and selection while disabled", () => {
    const service = new NgbDatepickerService();
    const models = vi.fn();
    const selected = vi.fn();
    service.model$.subscribe(models);
    service.dateSelect$.subscribe(selected);
    service.open(new NgbDate(2026, 8, 1));
    const before = models.mock.lastCall?.[0];
    service.set({ disabled: true });
    service.focus(new NgbDate(2026, 8, 10));
    service.open(new NgbDate(2026, 9, 1));
    service.select(new NgbDate(2026, 8, 10), { emitEvent: true });
    const after = models.mock.lastCall?.[0];
    expect(after.firstDate).toEqual(before.firstDate);
    expect(after.selectedDate).toBeNull();
    expect(selected).not.toHaveBeenCalled();
  });

  it("clamps focused and opened dates to configured limits", () => {
    const service = new NgbDatepickerService();
    const models = vi.fn();
    service.model$.subscribe(models);
    service.set({ minDate: new NgbDate(2026, 8, 10), maxDate: new NgbDate(2026, 8, 20) });
    service.open(new NgbDate(2026, 1, 1));
    expect(models.mock.lastCall?.[0].focusDate).toEqual(new NgbDate(2026, 8, 10));
    service.focus(new NgbDate(2026, 12, 1));
    expect(models.mock.lastCall?.[0].focusDate).toEqual(new NgbDate(2026, 8, 20));
  });

  it("emits repeated date selections when requested", () => {
    const service = new NgbDatepickerService();
    const selected = vi.fn();
    service.dateSelect$.subscribe(selected);
    const date = new NgbDate(2026, 8, 13);
    service.open(date);
    service.select(date, { emitEvent: true });
    service.select(date, { emitEvent: true });
    expect(selected).toHaveBeenCalledTimes(2);
  });

  it("marks every day disabled and removes it from tab order", () => {
    const service = new NgbDatepickerService();
    const models = vi.fn();
    service.model$.subscribe(models);
    service.open(new NgbDate(2026, 8, 1));
    service.set({ disabled: true });
    const model = models.mock.lastCall?.[0];
    const days = model.months.flatMap((month) => month.weeks.flatMap((week) => week.days));
    expect(days.every((day) => day.context.disabled)).toBe(true);
    expect(days.every((day) => day.tabindex === -1)).toBe(true);
  });

  it("throws when requesting a month outside the current view", () => {
    const service = new NgbDatepickerService();
    service.open(new NgbDate(2026, 8, 1));
    expect(() => service.getMonth({ year: 2030, month: 1, day: 1 })).toThrow("not found");
  });
});
