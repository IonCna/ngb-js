import type { ICompileService, IRootScopeService } from "angular";
import angular from "angular";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NgbDate } from "./ngb-date";
import { NgbDatepickerModule } from "./ngb-datepicker.module";

describe("datepicker navigation", () => {
  let $compile: ICompileService;
  let $rootScope: IRootScopeService;

  beforeEach(() => {
    angular.mock.module(NgbDatepickerModule.name);
    angular.mock.inject((_$compile_: ICompileService, _$rootScope_: IRootScopeService) => {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    });
  });

  it("renders button semantics and emits previous and next navigation", () => {
    const scope = $rootScope.$new() as IRootScopeService & {
      date: NgbDate;
      navigate: (event: string) => void;
    };
    scope.date = new NgbDate(2026, 8, 1);
    scope.navigate = vi.fn();
    const element = $compile(`
      <ngb-datepicker-navigation date="date" months="[]" show-select="false"
        select-boxes="{ months: [], years: [] }" navigate="navigate($event)"></ngb-datepicker-navigation>
    `)(scope);
    scope.$digest();
    const buttons = element[0].querySelectorAll<HTMLButtonElement>("button");
    expect(buttons).toHaveLength(2);
    expect(Array.from(buttons, (button) => button.type)).toEqual(["button", "button"]);
    expect(buttons[0].getAttribute("aria-label")).toBe("Previous month");
    expect(buttons[1].getAttribute("aria-label")).toBe("Next month");
    buttons[0].click();
    buttons[1].click();
    expect(scope.navigate).toHaveBeenCalledTimes(2);
  });

  it("disables navigation buttons independently", () => {
    const element = $compile(`
      <ngb-datepicker-navigation date="{ year: 2026, month: 8, day: 1 }" months="[]"
        show-select="false" prev-disabled="true" next-disabled="true"
        select-boxes="{ months: [], years: [] }"></ngb-datepicker-navigation>
    `)($rootScope.$new());
    $rootScope.$digest();
    expect(Array.from(element[0].querySelectorAll<HTMLButtonElement>("button"), (button) => button.disabled)).toEqual([
      true,
      true,
    ]);
  });

  it("generates and synchronizes month and year options", () => {
    const scope = $rootScope.$new() as IRootScopeService & { date: NgbDate; selected: (date: NgbDate) => void };
    scope.date = new NgbDate(2026, 8, 1);
    scope.selected = vi.fn();
    const element = $compile(`
      <ngb-datepicker-navigation-select date="date" months="[6, 7, 8, 9]" years="[2025, 2026, 2027]"
        select="selected($event)"></ngb-datepicker-navigation-select>
    `)(scope);
    scope.$digest();
    const selects = element[0].querySelectorAll<HTMLSelectElement>("select");
    expect(selects[0].options).toHaveLength(4);
    expect(selects[1].options).toHaveLength(3);
    expect(selects[0].value).toBe("number:8");
    expect(selects[1].value).toBe("number:2026");

    scope.date = new NgbDate(2027, 7, 1);
    scope.$digest();
    expect(selects[0].value).toBe("number:7");
    expect(selects[1].value).toBe("number:2027");
  });

  it("emits first-day dates when month or year changes", () => {
    const scope = $rootScope.$new() as IRootScopeService & { date: NgbDate; selected: (date: NgbDate) => void };
    scope.date = new NgbDate(2026, 8, 15);
    scope.selected = vi.fn();
    const element = $compile(`
      <ngb-datepicker-navigation-select date="date" months="[8, 9]" years="[2026, 2027]"
        select="selected($event)"></ngb-datepicker-navigation-select>
    `)(scope);
    scope.$digest();
    const controller = element.controller("ngbDatepickerNavigationSelect") as {
      changeMonth(month: number): void;
      changeYear(year: number): void;
    };
    controller.changeMonth(9);
    controller.changeYear(2027);
    expect(scope.selected).toHaveBeenNthCalledWith(1, new NgbDate(2026, 9, 1));
    expect(scope.selected).toHaveBeenNthCalledWith(2, new NgbDate(2027, 8, 1));
  });

  it("disables select boxes and supplies accessible names", () => {
    const element = $compile(`
      <ngb-datepicker-navigation-select date="{ year: 2026, month: 8, day: 1 }" disabled="true"
        months="[8]" years="[2026]"></ngb-datepicker-navigation-select>
    `)($rootScope.$new());
    $rootScope.$digest();
    const selects = element[0].querySelectorAll<HTMLSelectElement>("select");
    expect(Array.from(selects, (select) => select.disabled)).toEqual([true, true]);
    expect(Array.from(selects, (select) => select.getAttribute("aria-label"))).toEqual(["Select month", "Select year"]);
  });
});
