import { NgbCalendarGregorian } from "@ngb/datepicker/ngb-calendar.service";
import { NgbDate } from "@ngb/datepicker/ngb-date";
import type { NgbDatepicker } from "@ngb/datepicker/ngb-datepicker.component";
import { NgbDatepickerKeyboardService } from "@ngb/datepicker/ngb-datepicker-keyboard.service";
import { describe, expect, it, vi } from "vitest";

describe("NgbDatepickerKeyboardService", () => {
  function setup() {
    const calendar = new NgbCalendarGregorian();
    const focusDate = vi.fn();
    const focusSelect = vi.fn();
    const datepicker = {
      calendar,
      focusDate,
      focusSelect,
      state: {
        focusedDate: new NgbDate(2026, 8, 13),
        firstDate: new NgbDate(2026, 8, 1),
        lastDate: new NgbDate(2026, 8, 31),
        minDate: new NgbDate(2020, 1, 1),
        maxDate: new NgbDate(2030, 12, 31),
      },
    } as unknown as NgbDatepicker;
    return { datepicker, focusDate, focusSelect, service: new NgbDatepickerKeyboardService() };
  }

  function press(service: NgbDatepickerKeyboardService, datepicker: NgbDatepicker, key: string, shiftKey = false) {
    const event = new KeyboardEvent("keydown", { key, shiftKey, bubbles: true, cancelable: true });
    const stopPropagation = vi.spyOn(event, "stopPropagation");
    service.processKey(event, datepicker);
    return { event, stopPropagation };
  }

  it.each([
    ["ArrowLeft", new NgbDate(2026, 8, 12)],
    ["ArrowRight", new NgbDate(2026, 8, 14)],
    ["ArrowUp", new NgbDate(2026, 8, 6)],
    ["ArrowDown", new NgbDate(2026, 8, 20)],
  ])("moves focus for %s", (key, expected) => {
    const { datepicker, focusDate, service } = setup();
    const { event, stopPropagation } = press(service, datepicker, key);
    expect(focusDate).toHaveBeenCalledWith(expected);
    expect(event.defaultPrevented).toBe(true);
    expect(stopPropagation).toHaveBeenCalledOnce();
  });

  it.each([
    ["PageUp", false, new NgbDate(2026, 7, 13)],
    ["PageDown", false, new NgbDate(2026, 9, 13)],
    ["PageUp", true, new NgbDate(2025, 8, 13)],
    ["PageDown", true, new NgbDate(2027, 8, 13)],
  ])("moves focus for %s with shift=%s", (key, shiftKey, expected) => {
    const { datepicker, focusDate, service } = setup();
    press(service, datepicker, key, shiftKey);
    expect(focusDate).toHaveBeenCalledWith(expected);
  });

  it.each([
    ["Home", false, new NgbDate(2026, 8, 1)],
    ["End", false, new NgbDate(2026, 8, 31)],
    ["Home", true, new NgbDate(2020, 1, 1)],
    ["End", true, new NgbDate(2030, 12, 31)],
  ])("uses view or limit boundaries for %s with shift=%s", (key, shiftKey, expected) => {
    const { datepicker, focusDate, service } = setup();
    press(service, datepicker, key, shiftKey);
    expect(focusDate).toHaveBeenCalledWith(expected);
  });

  it.each(["Enter", " "])("selects the focused day with %j", (key) => {
    const { datepicker, focusSelect, service } = setup();
    const { event } = press(service, datepicker, key);
    expect(focusSelect).toHaveBeenCalledOnce();
    expect(event.defaultPrevented).toBe(true);
  });

  it("ignores unrelated keys", () => {
    const { datepicker, focusDate, focusSelect, service } = setup();
    const { event, stopPropagation } = press(service, datepicker, "Escape");
    expect(focusDate).not.toHaveBeenCalled();
    expect(focusSelect).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
    expect(stopPropagation).not.toHaveBeenCalled();
  });
});
