import angular, {type IInjectorService} from "angular";
import {beforeEach, describe, expect, it} from "vitest";
import {NgbTimepickerI18n} from "@ngb/timepicker/ngb-timepicker-i18n";
import {NgbTimepickerModule} from "@ngb/timepicker/ngb-timepicker.module";

describe("NgbTimepickerI18n", () => {
  let i18n: NgbTimepickerI18n;

  beforeEach(() => {
    angular.mock.module(NgbTimepickerModule.name);
    angular.mock.inject((_$injector_: IInjectorService) => {
      i18n = _$injector_.get<NgbTimepickerI18n>(NgbTimepickerI18n.$name);
    });
  });

  it("returns localized morning and afternoon periods", () => {
    expect(i18n.getMorningPeriod()).toBe("AM");
    expect(i18n.getAfternoonPeriod()).toBe("PM");
  });
});
