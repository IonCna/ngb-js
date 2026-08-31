import {describe, expect, it} from "vitest";
import {NgbTimepickerConfig} from "@ngb/timepicker/ngb-timepicker-config.service";

describe("NgbTimepickerConfig", () => {
  it("provides the same defaults as ng-bootstrap", () => {
    const config = new NgbTimepickerConfig();

    expect(config.meridian).toBe(false);
    expect(config.spinners).toBe(true);
    expect(config.seconds).toBe(false);
    expect(config.hourStep).toBe(1);
    expect(config.minuteStep).toBe(1);
    expect(config.secondStep).toBe(1);
    expect(config.disabled).toBe(false);
    expect(config.readonlyInputs).toBe(false);
    expect(config.size).toBe("medium");
  });
});
