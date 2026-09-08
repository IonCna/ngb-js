import { NgbDate } from "@ngb/datepicker/ngb-date";
import { NgbDatepickerModule } from "@ngb/datepicker/ngb-datepicker.module";
import angular, { type IAugmentedJQuery, type ICompileService, type IRootScopeService, type IScope } from "angular";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

interface TestScope extends IScope {
  currentMonth: number;
  date: NgbDate;
  disabled: boolean;
  focused: boolean;
  selected: boolean;
}

describe("NgbDatepickerDayView", () => {
  let $compile: ICompileService;
  let $rootScope: IRootScopeService;
  let element: IAugmentedJQuery | undefined;

  beforeEach(() => {
    angular.mock.module(NgbDatepickerModule.name);
    angular.mock.inject((_$compile_: ICompileService, _$rootScope_: IRootScopeService) => {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    });
  });

  afterEach(() => element?.remove());

  function setup(values: Partial<TestScope> = {}) {
    const scope = $rootScope.$new() as TestScope;
    Object.assign(
      scope,
      {
        currentMonth: 8,
        date: new NgbDate(2026, 8, 13),
        disabled: false,
        focused: false,
        selected: false,
      },
      values,
    );
    element = $compile(
      '<div ngb-datepicker-day-view current-month="currentMonth" date="date" disabled="disabled" focused="focused" selected="selected"></div>',
    )(scope);
    angular.element(document.body).append(element);
    scope.$digest();
    return { scope, day: element[0] as HTMLElement };
  }

  it("renders the day numeral with the Bootstrap day-button styling", () => {
    const { day } = setup();
    expect(day.textContent?.trim()).toBe("13");
    expect(day.classList.contains("btn")).toBe(true);
    expect(day.classList.contains("btn-light")).toBe(true);
    expect(day.style.width).toBe("2rem");
    expect(day.style.height).toBe("2rem");
  });

  it("marks selected and focused dates", () => {
    const { day } = setup({ selected: true, focused: true });
    expect(day.classList.contains("bg-primary")).toBe(true);
    expect(day.classList.contains("text-white")).toBe(true);
    expect(day.classList.contains("active")).toBe(true);
    expect(day.classList.contains("text-muted")).toBe(false);
  });

  it.each([
    { date: new NgbDate(2026, 7, 31), disabled: false },
    { date: new NgbDate(2026, 8, 13), disabled: true },
  ])("mutes outside or disabled days", (values) => {
    const { day } = setup(values);
    expect(day.classList.contains("text-muted")).toBe(true);
    expect(day.classList.contains("outside")).toBe(true);
    expect(day.classList.contains("opacity-50")).toBe(true);
  });

  it("updates its state classes when bindings change", () => {
    const { scope, day } = setup();
    scope.selected = true;
    scope.focused = true;
    scope.$digest();
    expect(day.classList.contains("bg-primary")).toBe(true);
    expect(day.classList.contains("active")).toBe(true);
  });
});
