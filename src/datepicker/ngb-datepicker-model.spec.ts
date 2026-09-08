import { describe, expect, it } from "vitest";
import { NgbDateStructAdapter } from "./adapters/ngb-date-adapter";
import { NgbDateNativeAdapter } from "./adapters/ngb-date-native-adapter";
import { NgbDateNativeUTCAdapter } from "./adapters/ngb-date-native-utc-adapter";
import { NgbDate } from "./ngb-date";
import { NgbDateISOParserFormatter } from "./ngb-date-parser-formatter";
import {
  checkDateInRange,
  checkMinBeforeMax,
  dateComparator,
  generateSelectBoxYears,
  isChangedDate,
  isChangedMonth,
} from "./ngb-datepicker-tools";

describe("NgbDate", () => {
  const date = new NgbDate(2016, 8, 18);

  it("creates dates from structs and preserves NgbDate instances", () => {
    expect(NgbDate.from({ year: 2010, month: 10, day: 2 })).toEqual(new NgbDate(2010, 10, 2));
    expect(NgbDate.from(date)).toBe(date);
    expect(NgbDate.from(null)).toBeNull();
    expect(NgbDate.from({ year: "2010" as unknown as number, month: 10, day: 2 })).toEqual(
      new NgbDate(null as unknown as number, 10, 2),
    );
  });

  it("compares dates and plain structs", () => {
    expect(date.equals({ year: 2016, month: 8, day: 18 })).toBe(true);
    expect(date.equals(new NgbDate(2016, 8, 17))).toBe(false);
    expect(date.equals(null)).toBe(false);
    expect(date.before({ year: 2016, month: 8, day: 19 })).toBe(true);
    expect(date.before({ year: 2016, month: 8, day: 18 })).toBe(false);
    expect(date.after({ year: 2015, month: 12, day: 31 })).toBe(true);
    expect(date.after(undefined)).toBe(false);
  });
});

describe("NgbDateISOParserFormatter", () => {
  const formatter = new NgbDateISOParserFormatter();

  it("parses complete, partial and invalid dates", () => {
    expect(formatter.parse("2016-05-12")).toEqual({ year: 2016, month: 5, day: 12 });
    expect(formatter.parse("2011-5")).toEqual({ year: 2011, month: 5, day: null });
    expect(formatter.parse("2011")).toEqual({ year: 2011, month: null, day: null });
    expect(formatter.parse("foo-bar-baz")).toBeNull();
    expect(formatter.parse("")).toBeNull();
    expect(formatter.parse(null as unknown as string)).toBeNull();
  });

  it("formats complete, partial and null dates", () => {
    expect(formatter.format({ year: 2016, month: 10, day: 5 })).toBe("2016-10-05");
    expect(formatter.format({ year: 2016, month: Number.NaN, day: undefined as unknown as number })).toBe("2016--");
    expect(formatter.format(null)).toBe("");
  });
});

describe("datepicker model adapters", () => {
  it("copies valid date structs and rejects incomplete structs", () => {
    const adapter = new NgbDateStructAdapter();
    const value = { year: 2016, month: 10, day: 15 };
    expect(adapter.fromModel(value)).toEqual(value);
    expect(adapter.fromModel(value)).not.toBe(value);
    expect(adapter.toModel(value)).toEqual(value);
    expect(adapter.fromModel({ year: 2016, month: 10 } as never)).toBeNull();
  });

  it("converts local native dates in both directions", () => {
    const adapter = new NgbDateNativeAdapter();
    expect(adapter.fromModel(new Date(2016, 4, 1))).toEqual({ year: 2016, month: 5, day: 1 });
    expect(adapter.toModel({ year: 2016, month: 10, day: 15 })).toEqual(new Date(2016, 9, 15, 12));
    expect(adapter.fromModel(new Date("invalid"))).toBeNull();
    expect(adapter.toModel({ year: 2016, month: 10 } as never)).toBeNull();
  });

  it("converts UTC native dates in both directions", () => {
    const adapter = new NgbDateNativeUTCAdapter();
    expect(adapter.fromModel(new Date(Date.UTC(2016, 4, 1)))).toEqual({ year: 2016, month: 5, day: 1 });
    expect(adapter.toModel({ year: 2016, month: 10, day: 15 })).toEqual(new Date(Date.UTC(2016, 9, 15)));
  });

  it("preserves years from 0 through 99", () => {
    const local = new NgbDateNativeAdapter().toModel({ year: 1, month: 1, day: 1 });
    const utc = new NgbDateNativeUTCAdapter().toModel({ year: 99, month: 1, day: 1 });
    expect(local?.getFullYear()).toBe(1);
    expect(utc?.getUTCFullYear()).toBe(99);
  });
});

describe("datepicker tools", () => {
  const min = new NgbDate(2020, 1, 10);
  const max = new NgbDate(2020, 1, 20);

  it("detects changed dates and months", () => {
    expect(dateComparator(min, new NgbDate(2020, 1, 10))).toBe(true);
    expect(isChangedDate(min, max)).toBe(true);
    expect(isChangedMonth(min, new NgbDate(2020, 1, 31))).toBe(false);
    expect(isChangedMonth(min, max)).toBe(false);
    expect(isChangedMonth(min, new NgbDate(2020, 2, 1))).toBe(true);
  });

  it("validates and clamps date ranges", () => {
    expect(() => checkMinBeforeMax(max, min)).toThrow("should be greater than");
    expect(() => checkMinBeforeMax(min, max)).not.toThrow();
    expect(checkDateInRange(new NgbDate(2019, 12, 31), min, max)).toBe(min);
    expect(checkDateInRange(new NgbDate(2021, 1, 1), min, max)).toBe(max);
    expect(checkDateInRange(new NgbDate(2020, 1, 15), min, max)).toEqual(new NgbDate(2020, 1, 15));
  });

  it("generates bounded year choices", () => {
    expect(generateSelectBoxYears(new NgbDate(2020, 1, 1), null, null)).toEqual(
      Array.from({ length: 21 }, (_, index) => 2010 + index),
    );
    expect(generateSelectBoxYears(new NgbDate(2020, 1, 1), new NgbDate(2018, 1, 1), new NgbDate(2022, 1, 1))).toEqual([
      2018, 2019, 2020, 2021, 2022,
    ]);
  });
});
