import { NgbTimepickerI18n } from "@ngb/timepicker/ngb-timepicker-i18n";
import { NgbTimepickerModule } from "@ngb/timepicker/ngb-timepicker.module";
import { TestBed } from "ngjs-core/testing";
import { beforeEach, describe, expect, it } from "vitest";

describe("NgbTimepickerI18n", () => {
  let i18n: NgbTimepickerI18n;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [NgbTimepickerModule] });
    i18n = TestBed.inject(NgbTimepickerI18n);
  });

  it("returns localized morning and afternoon periods", () => {
    expect(i18n.getMorningPeriod()).toBe("AM");
    expect(i18n.getAfternoonPeriod()).toBe("PM");
  });
});
