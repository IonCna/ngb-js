import angular, {
  type IAugmentedJQuery,
  type ICompileService,
  type IProvideService,
  type IRootScopeService,
  type IScope,
} from "angular";
import {afterEach, beforeEach, describe, expect, it} from "vitest";
import {NgbTimeAdapter} from "./ngb-timepicker-adapter.service";
import {NgbTimepickerModule} from "./ngb-timepicker.module";
import type {NgbTimeStruct} from "./ngb-timepicker-struct";

class StringTimeAdapter extends NgbTimeAdapter<string> {
  fromModel(value: string | null): NgbTimeStruct | null {
    if (!value) {
      return null;
    }
    const [hour, minute, second] = value.split(":").map(Number);
    return {hour, minute, second};
  }

  toModel(time: NgbTimeStruct | null): string | null {
    return time ? [time.hour, time.minute, time.second].map((part) => String(part).padStart(2, "0")).join(":") : null;
  }
}

describe("NgbTimepicker with a custom NgbTimeAdapter", () => {
  let $compile: ICompileService;
  let $rootScope: IRootScopeService;
  let element: IAugmentedJQuery | undefined;

  beforeEach(() => {
    angular.mock.module(NgbTimepickerModule.name, ($provide: IProvideService) => {
      $provide.factory(NgbTimeAdapter.$name, () => new StringTimeAdapter());
    });
    angular.mock.inject((_$compile_: ICompileService, _$rootScope_: IRootScopeService) => {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    });
  });

  afterEach(() => element?.remove());

  function setup() {
    const scope = $rootScope.$new() as IScope & {time: string | null};
    scope.time = "09:25:00";
    element = $compile('<ngb-timepicker ng-model="time"></ngb-timepicker>')(scope);
    angular.element(document.body).append(element);
    scope.$digest();
    return {scope, root: element[0] as HTMLElement};
  }

  it("renders a model parsed by the replacement adapter", () => {
    const {root} = setup();
    expect(Array.from(root.querySelectorAll<HTMLInputElement>("input"), ({value}) => value)).toEqual(["09", "25"]);
  });

  it("writes input changes through the replacement adapter", () => {
    const {scope, root} = setup();
    const minute = root.querySelectorAll<HTMLInputElement>("input")[1];
    minute.value = "45";
    minute.dispatchEvent(new Event("input", {bubbles: true}));
    minute.dispatchEvent(new Event("change", {bubbles: true}));
    expect(scope.time).toBe("09:45:00");
  });
});
