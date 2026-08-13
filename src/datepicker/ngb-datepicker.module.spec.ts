import { NgbCalendarBuddhist } from "@ngb/datepicker/buddhist/ngb-calendar-buddhist.ts";
import { NgbDate } from "@ngb/datepicker/ngb-date.ts";
import type { NgbDateStruct } from "@ngb/datepicker/ngb-date-struct.ts";
import { NgbDatepicker } from "@ngb/datepicker/ngb-datepicker.component.ts";
import { NgbDatepickerModule } from "@ngb/datepicker/ngb-datepicker.module.ts";
import { NgbInputDatepicker } from "@ngb/datepicker/ngb-input-datepicker.directive.ts";
import { NgbModule } from "@ngb/ngb.module.ts";
import type { ICompileService, IRootScopeService } from "angular";
import angular from "angular";
import { beforeEach, describe, expect, it } from "vitest";

describe("NgbDatepickerModule", () => {
  let $compile: ICompileService;
  let $rootScope: IRootScopeService;

  beforeEach(() => {
    angular.mock.module(NgbDatepickerModule.name);
    angular.mock.inject((_$compile_: ICompileService, _$rootScope_: IRootScopeService) => {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    });
  });

  it("renders an inline datepicker and binds ngModel", () => {
    const scope = $rootScope.$new() as IRootScopeService & { date: NgbDateStruct };
    scope.date = { year: 2026, month: 8, day: 13 };
    const element = $compile('<ngb-datepicker ng-model="date"></ngb-datepicker>')(scope);

    scope.$digest();

    expect(element[0].querySelectorAll(".ngb-dp-day").length).toBeGreaterThan(0);
    expect(element[0].querySelector("ngb-datepicker-navigation")).not.toBeNull();

    element.remove();
    scope.$destroy();
  });

  it("opens and closes the input popup", async () => {
    const scope = $rootScope.$new() as IRootScopeService & { date: NgbDateStruct };
    scope.date = { year: 2026, month: 8, day: 13 };
    const element = $compile('<input ng-model="date" ngb-datepicker>')(scope);
    document.body.appendChild(element[0]);
    scope.$digest();

    const datepicker = element.controller(NgbInputDatepicker.$name) as NgbInputDatepicker;
    datepicker.open();
    scope.$digest();

    expect(datepicker.isOpen()).toBe(true);
    expect(document.querySelector("ngb-datepicker.dropdown-menu")).not.toBeNull();

    datepicker.close(false);
    await new Promise((resolve) => setTimeout(resolve, 0));
    scope.$digest();
    element.remove();
    scope.$destroy();
  });

  it("updates the inline model when a date is selected", () => {
    const scope = $rootScope.$new() as IRootScopeService & { date: NgbDateStruct };
    scope.date = { year: 2026, month: 8, day: 13 };
    const element = $compile('<ngb-datepicker ng-model="date"></ngb-datepicker>')(scope);
    scope.$digest();

    const datepicker = element.controller(NgbDatepicker.$name) as NgbDatepicker;
    datepicker.onDateSelect(new NgbDate(2026, 8, 20));
    scope.$digest();

    expect(scope.date).toEqual({ year: 2026, month: 8, day: 20 });

    element.remove();
    scope.$destroy();
  });

  it("moves focus with the keyboard service", () => {
    const scope = $rootScope.$new() as IRootScopeService & { date: NgbDateStruct };
    scope.date = { year: 2026, month: 8, day: 13 };
    const element = $compile('<ngb-datepicker ng-model="date"></ngb-datepicker>')(scope);
    scope.$digest();

    const datepicker = element.controller(NgbDatepicker.$name) as NgbDatepicker;
    datepicker.focusDate(scope.date);
    scope.$digest();
    datepicker.processKey(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    scope.$digest();

    expect(datepicker.state.focusedDate).toEqual(new NgbDate(2026, 8, 14));

    element.remove();
    scope.$destroy();
  });

  it("selects a popup day and closes automatically", async () => {
    const scope = $rootScope.$new() as IRootScopeService & { date: NgbDateStruct };
    scope.date = { year: 2026, month: 8, day: 13 };
    const element = $compile('<input ng-model="date" ngb-datepicker>')(scope);
    document.body.appendChild(element[0]);
    scope.$digest();

    const input = element.controller(NgbInputDatepicker.$name) as NgbInputDatepicker;
    input.open();
    scope.$digest();

    const popups = document.querySelectorAll("ngb-datepicker.dropdown-menu");
    const popup = popups[popups.length - 1];
    const enabledDays = Array.from(popup.querySelectorAll<HTMLElement>(".ngb-dp-day:not(.disabled):not(.hidden)"));
    const day = enabledDays.find((candidate) => candidate.getAttribute("aria-selected") !== "true");
    expect(day).toBeDefined();
    if (!day) throw new Error("Expected an enabled day in the popup.");
    day.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    scope.$digest();
    await new Promise((resolve) => setTimeout(resolve, 0));
    scope.$digest();

    expect(input.isOpen()).toBe(false);
    expect(scope.date).not.toEqual({ year: 2026, month: 8, day: 13 });

    element.remove();
    scope.$destroy();
  });

  it("parses manual input and validates date limits", () => {
    const scope = $rootScope.$new() as IRootScopeService & {
      date?: NgbDateStruct;
      minDate: NgbDateStruct;
      maxDate: NgbDateStruct;
    };
    scope.minDate = { year: 2026, month: 8, day: 1 };
    scope.maxDate = { year: 2026, month: 8, day: 31 };
    const element = $compile(
      '<input name="date" ng-model="date" ngb-datepicker min-date="minDate" max-date="maxDate">',
    )(scope);
    document.body.appendChild(element[0]);
    scope.$digest();

    const input = element[0] as HTMLInputElement;
    input.value = "2026-08-20";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    scope.$digest();
    expect(scope.date).toEqual({ year: 2026, month: 8, day: 20 });

    input.value = "2026-09-01";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    scope.$digest();
    expect((element.controller("ngModel") as angular.INgModelController).$error.ngbDate).toBe(true);

    element.remove();
    scope.$destroy();
  });

  it("renders a projected content template", () => {
    const scope = $rootScope.$new();
    const element = $compile(`
      <ngb-datepicker>
        <ng-template ngb-datepicker-content let-datepicker>
          <div class="custom-content">{{ datepicker.state.months.length }}</div>
        </ng-template>
      </ngb-datepicker>
    `)(scope);
    scope.$digest();

    expect(element[0].querySelector(".custom-content")?.textContent?.trim()).toBe("1");

    element.remove();
    scope.$destroy();
  });

  it("accepts a calendar instance created by the consumer", () => {
    const scope = $rootScope.$new() as IRootScopeService & { calendar: NgbCalendarBuddhist };
    scope.calendar = new NgbCalendarBuddhist();
    const element = $compile('<ngb-datepicker calendar="calendar"></ngb-datepicker>')(scope);
    scope.$digest();

    const datepicker = element.controller(NgbDatepicker.$name) as NgbDatepicker;
    expect(datepicker.calendar).toBe(scope.calendar);

    element.remove();
    scope.$destroy();
  });

  it("clears dynamic limits when their bindings become undefined", () => {
    const scope = $rootScope.$new() as IRootScopeService & { minDate?: NgbDateStruct; maxDate?: NgbDateStruct };
    scope.minDate = { year: 2026, month: 1, day: 1 };
    scope.maxDate = { year: 2026, month: 12, day: 31 };
    const element = $compile('<ngb-datepicker min-date="minDate" max-date="maxDate"></ngb-datepicker>')(scope);
    scope.$digest();

    const datepicker = element.controller(NgbDatepicker.$name) as NgbDatepicker;
    expect(datepicker.state.minDate).toEqual(new NgbDate(2026, 1, 1));
    scope.minDate = undefined;
    scope.maxDate = undefined;
    scope.$digest();
    expect(datepicker.state.minDate).toBeNull();
    expect(datepicker.state.maxDate).toBeNull();

    element.remove();
    scope.$destroy();
  });

  it("keeps the original public form callbacks and validation errors", () => {
    const scope = $rootScope.$new() as IRootScopeService & { minDate: NgbDateStruct };
    scope.minDate = { year: 2026, month: 8, day: 10 };
    const element = $compile('<input ngb-datepicker min-date="minDate">')(scope);
    scope.$digest();

    const input = element.controller(NgbInputDatepicker.$name) as NgbInputDatepicker;
    const changes: unknown[] = [];
    let touched = 0;
    input.registerOnChange((value) => changes.push(value));
    input.registerOnTouched(() => touched++);
    input.manualDateChange("2026-08-13");
    input.onBlur();

    expect(changes).toEqual([{ year: 2026, month: 8, day: 13 }]);
    expect(touched).toBe(1);
    expect(input.validate({ value: { year: 2026, month: 8, day: 1 } })).toEqual({
      ngbDate: { minDate: { minDate: scope.minDate, actual: { year: 2026, month: 8, day: 1 } } },
    });

    element.remove();
    scope.$destroy();
  });

  it("can open a disabled popup like the original directive", async () => {
    const scope = $rootScope.$new();
    const element = $compile('<input ngb-datepicker disabled="true">')(scope);
    document.body.appendChild(element[0]);
    scope.$digest();

    const input = element.controller(NgbInputDatepicker.$name) as NgbInputDatepicker;
    expect(input.disabled).toBe(true);
    input.open();
    scope.$digest();
    expect(input.isOpen()).toBe(true);
    expect(input.disabled).toBe(true);
    expect(document.querySelector("ngb-datepicker.dropdown-menu.disabled")).not.toBeNull();

    input.close(false);
    await new Promise((resolve) => setTimeout(resolve, 0));
    element.remove();
    scope.$destroy();
  });

  it("renders NgbDatepickerMonth from a custom content template", () => {
    const scope = $rootScope.$new();
    const element = $compile(`
      <ngb-datepicker>
        <ng-template ngb-datepicker-content let-datepicker>
          <ngb-datepicker-month month="datepicker.state.months[0]"></ngb-datepicker-month>
        </ng-template>
      </ngb-datepicker>
    `)(scope);
    scope.$digest();

    expect(element[0].querySelectorAll(".ngb-dp-day").length).toBeGreaterThan(0);
    element.remove();
    scope.$destroy();
  });
});

describe("NgbDatepicker through NgbModule", () => {
  it("renders from the root module", () => {
    angular.mock.module(NgbModule.name);
    angular.mock.inject(($compile: ICompileService, $rootScope: IRootScopeService) => {
      const scope = $rootScope.$new();
      const element = $compile("<ngb-datepicker></ngb-datepicker>")(scope);
      scope.$digest();

      expect(element.controller(NgbDatepicker.$name)).toBeInstanceOf(NgbDatepicker);
      expect(element[0].querySelectorAll(".ngb-dp-day").length).toBeGreaterThan(0);

      element.remove();
      scope.$destroy();
    });
  });
});
