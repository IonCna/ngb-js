import { describe, expect, it } from "vitest";
import { NgbTypeaheadConfig } from "./ngb-typeahead-config.service";

describe("NgbTypeaheadConfig", () => {
  it("provides the same defaults as ng-bootstrap", () => {
    const config = new NgbTypeaheadConfig();
    expect(config.container).toBeUndefined();
    expect(config.editable).toBe(true);
    expect(config.focusFirst).toBe(true);
    expect(config.selectOnExact).toBe(false);
    expect(config.showHint).toBe(false);
    expect(config.placement).toEqual(["bottom-start", "bottom-end", "top-start", "top-end"]);
    const options = { placement: "bottom" as const };
    expect(config.popperOptions(options)).toBe(options);
  });
});
