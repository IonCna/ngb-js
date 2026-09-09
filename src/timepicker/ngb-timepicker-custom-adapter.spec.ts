import angular, {
  type IAugmentedJQuery,
  type ICompileService,
  type IRootScopeService,
  type IScope,
} from "angular";
import { NgModule } from "ngjs-core";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { configureTestBed, type NgbTestBed } from "../../test/testbed";
import { NgbTimeAdapter } from "./ngb-timepicker-adapter.service";
import { NgbTimepickerModule } from "./ngb-timepicker.module";
import type { NgbTimeStruct } from "./ngb-timepicker-struct";

class StringTimeAdapter extends NgbTimeAdapter<string> {
  fromModel(value: string | null): NgbTimeStruct | null {
    if (!value) {
      return null;
    }
    const [hour, minute, second] = value.split(":").map(Number);
    return { hour, minute, second };
  }

  toModel(time: NgbTimeStruct | null): string | null {
    return time ? [time.hour, time.minute, time.second].map((part) => String(part).padStart(2, "0")).join(":") : null;
  }
}

// upstream: el adapter se reemplaza por DI (`{ provide: NgbTimeAdapter, useClass: ... }`).
@NgModule({
  imports: [NgbTimepickerModule],
  providers: [{ provide: NgbTimeAdapter, useClass: StringTimeAdapter }],
})
class CustomAdapterModule {}

describe("NgbTimepicker with a custom NgbTimeAdapter", () => {
  let tb: NgbTestBed;
  let $compile: ICompileService;
  let $rootScope: IRootScopeService;
  let element: IAugmentedJQuery | undefined;

  beforeEach(async () => {
    tb = await configureTestBed(CustomAdapterModule);
    $compile = tb.$compile;
    $rootScope = tb.$rootScope;
  });

  afterEach(() => {
    element?.remove();
    tb.destroy();
  });

  function setup() {
    const scope = $rootScope.$new() as IScope & { time: string | null };
    scope.time = "09:25:00";
    element = $compile('<ngb-timepicker ng-model="time"></ngb-timepicker>')(scope);
    angular.element(document.body).append(element);
    scope.$digest();
    return { scope, root: element[0] as HTMLElement };
  }

  it("renders a model parsed by the replacement adapter", () => {
    const { root } = setup();
    expect(Array.from(root.querySelectorAll<HTMLInputElement>("input"), ({ value }) => value)).toEqual(["09", "25"]);
  });

  it("writes input changes through the replacement adapter", () => {
    const { scope, root } = setup();
    const minute = root.querySelectorAll<HTMLInputElement>("input")[1];
    minute.value = "45";
    minute.dispatchEvent(new Event("input", { bubbles: true }));
    minute.dispatchEvent(new Event("change", { bubbles: true }));
    expect(scope.time).toBe("09:45:00");
  });
});
