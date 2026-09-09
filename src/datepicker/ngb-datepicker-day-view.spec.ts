import { NgbDate } from "@ngb/datepicker/ngb-date";
import { NgbDatepickerModule } from "@ngb/datepicker/ngb-datepicker.module";
import type { IAugmentedJQuery, ICompileService, IRootScopeService, IScope } from "angular";
import angular from "angular";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { configureTestBed, type NgbTestBed } from "../../test/testbed.ts";

interface TestScope extends IScope {
  currentMonth: number;
  date: NgbDate;
  disabled: boolean;
  focused: boolean;
  selected: boolean;
}

describe("NgbDatepickerDayView", () => {
  let tb: NgbTestBed;
  let $compile: ICompileService;
  let $rootScope: IRootScopeService;
  let element: IAugmentedJQuery | undefined;

  beforeEach(async () => {
    tb = await configureTestBed(NgbDatepickerModule);
    $compile = tb.$compile;
    $rootScope = tb.$rootScope;
  });

  afterEach(() => {
    element?.remove();
    tb.destroy();
  });

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
    // upstream host: `class: 'btn-light'`. El sizing (`width/height: 2rem`) vive en
    // `datepicker-day-view.css` (global), no en el host.
    expect(day.classList.contains("btn-light")).toBe(true);
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
    // upstream host: `[class.text-muted]='isMuted()'`, `[class.outside]='isMuted()'`.
    // El `opacity: .5` de `.outside` vive en `datepicker-day-view.css`.
    expect(day.classList.contains("text-muted")).toBe(true);
    expect(day.classList.contains("outside")).toBe(true);
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
