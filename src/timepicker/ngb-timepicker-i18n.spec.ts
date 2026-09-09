import { Injector } from "ngjs-core";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { configureTestBed, type NgbTestBed } from "../../test/testbed";
import { NgbTimepickerI18n } from "@ngb/timepicker/ngb-timepicker-i18n";
import { NgbTimepickerModule } from "@ngb/timepicker/ngb-timepicker.module";

describe("NgbTimepickerI18n", () => {
  let tb: NgbTestBed;
  let i18n: NgbTimepickerI18n;

  beforeEach(async () => {
    tb = await configureTestBed(NgbTimepickerModule);
    i18n = tb.$injector.get<Injector>(Injector.$name).get(NgbTimepickerI18n);
  });

  afterEach(() => tb.destroy());

  it("returns localized morning and afternoon periods", () => {
    expect(i18n.getMorningPeriod()).toBe("AM");
    expect(i18n.getAfternoonPeriod()).toBe("PM");
  });
});
