import {describe, expect, it} from "vitest";
import {NgbTimeStructAdapter} from "@ngb/timepicker/ngb-timepicker-adapter.service";

describe("NgbTimeStructAdapter", () => {
  const adapter = new NgbTimeStructAdapter();
  const invalidValues = [null, undefined, "", "s", 2, {}, new Date(), {hour: 20}];

  it.each(invalidValues)("converts invalid model %s to null", (value) => {
    expect(adapter.fromModel(value as never)).toBeNull();
    expect(adapter.toModel(value as never)).toBeNull();
  });

  it("converts complete time values", () => {
    const value = {hour: 19, minute: 5, second: 1};
    expect(adapter.fromModel(value)).toEqual(value);
    expect(adapter.toModel(value)).toEqual(value);
  });

  it("normalizes missing or invalid seconds to null", () => {
    expect(adapter.fromModel({hour: 19, minute: 5} as never)).toEqual({hour: 19, minute: 5, second: null});
    expect(adapter.toModel({hour: 19, minute: 5, second: null} as never)).toEqual({
      hour: 19,
      minute: 5,
      second: null,
    });
  });

  it("creates the default adapter instance", () => {
    expect(NgbTimeStructAdapter.$factory()).toBeInstanceOf(NgbTimeStructAdapter);
  });
});
