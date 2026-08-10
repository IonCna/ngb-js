import angular, {
  type IAugmentedJQuery,
  type ICompileService,
  type IFormController,
  type IInjectorService,
  type ILogService,
  type INgModelController,
  type IRootScopeService,
  type IScope,
} from "angular";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {NgbTimepickerModule} from "./ngb-timepicker.module";
import {NgbTimepickerConfig} from "./ngb-timepicker-config.service";

interface TimeStruct {
  hour: number;
  minute: number;
  second: number;
}

interface TestScope extends IScope {
  time?: TimeStruct | null;
  disabled?: boolean;
  meridian?: boolean;
  seconds?: boolean;
  spinners?: boolean;
  readonlyInputs?: boolean;
  size?: "small" | "medium" | "large";
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
  form?: IFormController & {control: INgModelController};
}

describe("NgbTimepicker", () => {
  let $compile: ICompileService;
  let $rootScope: IRootScopeService;
  let $log: ILogService;
  let config: NgbTimepickerConfig;
  const mounted: IAugmentedJQuery[] = [];

  beforeEach(() => {
    angular.mock.module(NgbTimepickerModule.name);
    angular.mock.inject(
      (
        _$compile_: ICompileService,
        _$rootScope_: IRootScopeService,
        _$log_: ILogService,
        _$injector_: IInjectorService,
      ) => {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $log = _$log_;
        config = _$injector_.get<NgbTimepickerConfig>(NgbTimepickerConfig.$name);
      },
    );
  });

  afterEach(() => {
    mounted.forEach((element) => element.remove());
    mounted.length = 0;
  });

  function setup(
    template = '<ngb-timepicker ng-model="time"></ngb-timepicker>',
    values: Partial<TestScope> = {time: {hour: 13, minute: 5, second: 9}},
  ) {
    const scope = $rootScope.$new() as TestScope;
    Object.assign(scope, values);
    const element = $compile(template)(scope);
    angular.element(document.body).append(element);
    mounted.push(element);
    scope.$digest();
    return {scope, element, root: element[0] as HTMLElement};
  }

  function inputs(root: HTMLElement): HTMLInputElement[] {
    return Array.from(root.querySelectorAll<HTMLInputElement>("input"));
  }

  function buttons(root: HTMLElement): HTMLButtonElement[] {
    return Array.from(root.querySelectorAll<HTMLButtonElement>("button"));
  }

  function click(button: HTMLButtonElement) {
    button.click();
  }

  function change(input: HTMLInputElement, value: string) {
    input.value = value;
    input.dispatchEvent(new Event("input", {bubbles: true, cancelable: true}));
    input.dispatchEvent(new Event("change", {bubbles: true, cancelable: true}));
  }

  function keydown(input: HTMLInputElement, key: string) {
    input.dispatchEvent(new KeyboardEvent("keydown", {key, bubbles: true, cancelable: true}));
  }

  it("requires ng-model and reports a useful error when it is missing", () => {
    const error = vi.spyOn($log, "error");
    setup("<ngb-timepicker></ngb-timepicker>", {});
    expect(error).toHaveBeenCalledWith("[ngbTimepicker] The ng-model attribute is required.");
  });

  it("renders and pads the model value", () => {
    const {root} = setup();
    expect(inputs(root).map(({value}) => value)).toEqual(["13", "05"]);
  });

  it("uses values supplied through NgbTimepickerConfig", () => {
    config.meridian = true;
    config.spinners = false;
    config.seconds = true;
    config.readonlyInputs = true;
    config.size = "large";
    const {root} = setup();

    expect(inputs(root).map(({value}) => value)).toEqual(["01", "05", "09"]);
    expect(inputs(root).every(({readOnly}) => readOnly)).toBe(true);
    expect(inputs(root).every((input) => input.classList.contains("form-control-lg"))).toBe(true);
    expect(buttons(root)).toHaveLength(1);
    expect(buttons(root)[0].textContent?.trim()).toBe("PM");
  });

  it("updates when the external model changes", () => {
    const {scope, root} = setup();
    scope.time = {hour: 2, minute: 3, second: 4};
    scope.$digest();
    expect(inputs(root).map(({value}) => value)).toEqual(["02", "03"]);
  });

  it.each([null, undefined, {hour: undefined, minute: "aaa", second: 0}])(
    "renders an invalid or empty model as blank inputs (%s)",
    (time) => {
      const {root} = setup(undefined, {time: time as TimeStruct | null | undefined});
      expect(inputs(root).map(({value}) => value)).toEqual(["", ""]);
    },
  );

  it("increments, decrements and wraps hours and minutes", () => {
    const {scope, root} = setup(undefined, {time: {hour: 23, minute: 59, second: 0}});
    const spinnerButtons = buttons(root);

    click(spinnerButtons[0]);
    expect(scope.time).toEqual({hour: 0, minute: 59, second: 0});
    click(spinnerButtons[2]);
    expect(scope.time).toEqual({hour: 1, minute: 0, second: 0});
    click(spinnerButtons[1]);
    expect(scope.time).toEqual({hour: 0, minute: 0, second: 0});
    click(spinnerButtons[3]);
    expect(scope.time).toEqual({hour: 23, minute: 59, second: 0});
  });

  it("uses custom steps for all three fields", () => {
    const {scope, root} = setup(
      '<ngb-timepicker ng-model="time" seconds="true" hour-step="2" minute-step="5" second-step="10"></ngb-timepicker>',
      {time: {hour: 1, minute: 2, second: 3}},
    );
    const spinnerButtons = buttons(root);
    click(spinnerButtons[0]);
    click(spinnerButtons[2]);
    click(spinnerButtons[4]);
    expect(scope.time).toEqual({hour: 3, minute: 7, second: 13});
  });

  it("updates the model from inputs and emits null while a value is invalid", () => {
    const {scope, root} = setup();
    const fields = inputs(root);
    change(fields[0], "08");
    expect(scope.time).toEqual({hour: 8, minute: 5, second: 9});
    change(fields[1], "");
    expect(scope.time).toBeNull();
    expect(fields[1].value).toBe("");
  });

  it("normalizes overflowing input values like the original", () => {
    const {scope, root} = setup(undefined, {time: {hour: 8, minute: 5, second: 9}});
    change(inputs(root)[1], "99");
    expect(scope.time).toEqual({hour: 9, minute: 39, second: 9});
    expect(inputs(root)[1].value).toBe("39");
  });

  it("filters non-numeric characters before processing input", () => {
    const {root} = setup();
    const hour = inputs(root)[0];
    hour.value = "1a2";
    hour.dispatchEvent(new Event("input", {bubbles: true}));
    expect(hour.value).toBe("12");
  });

  it("supports ArrowUp and ArrowDown", () => {
    const {scope, root} = setup(undefined, {time: {hour: 10, minute: 10, second: 0}});
    const fields = inputs(root);
    keydown(fields[0], "ArrowUp");
    keydown(fields[1], "ArrowDown");
    expect(scope.time).toEqual({hour: 11, minute: 9, second: 0});
  });

  it("renders seconds and updates them", () => {
    const {scope, root} = setup('<ngb-timepicker ng-model="time" seconds="true"></ngb-timepicker>');
    expect(inputs(root).map(({value}) => value)).toEqual(["13", "05", "09"]);
    change(inputs(root)[2], "42");
    expect(scope.time).toEqual({hour: 13, minute: 5, second: 42});
  });

  it("normalizes a missing second to zero when seconds are hidden", () => {
    const {scope, root} = setup(undefined, {time: {hour: 8, minute: 30} as TimeStruct});
    expect(inputs(root).map(({value}) => value)).toEqual(["08", "30"]);
    click(buttons(root)[0]);
    expect(scope.time).toEqual({hour: 9, minute: 30, second: 0});
  });

  it("formats 12-hour time and toggles the meridian", () => {
    const {scope, root} = setup('<ngb-timepicker ng-model="time" meridian="true"></ngb-timepicker>');
    expect(inputs(root).map(({value}) => value)).toEqual(["01", "05"]);
    expect(buttons(root).at(-1)?.textContent?.trim()).toBe("PM");
    click(buttons(root).at(-1)!);
    expect(scope.time).toEqual({hour: 1, minute: 5, second: 9});
    expect(buttons(root).at(-1)?.textContent?.trim()).toBe("AM");
  });

  it("interprets entered hours in the current meridian", () => {
    const {scope, root} = setup('<ngb-timepicker ng-model="time" meridian="true"></ngb-timepicker>');
    change(inputs(root)[0], "02");
    expect(scope.time).toEqual({hour: 14, minute: 5, second: 9});
    click(buttons(root).at(-1)!);
    change(inputs(root)[0], "12");
    expect(scope.time).toEqual({hour: 0, minute: 5, second: 9});
  });

  it("participates in AngularJS form validity and touched state", () => {
    const {scope, root} = setup(
      '<form name="form"><ngb-timepicker name="control" ng-model="time" required></ngb-timepicker></form>',
      {time: {hour: 10, minute: 20, second: 0}},
    );
    expect(scope.form!.control.$valid).toBe(true);
    inputs(root)[0].dispatchEvent(new FocusEvent("blur"));
    expect(scope.form!.control.$touched).toBe(true);
    scope.time = null;
    scope.$digest();
    expect(scope.form!.control.$invalid).toBe(true);
  });

  it("disables inputs and spinner buttons", () => {
    const {scope, root} = setup('<ngb-timepicker ng-model="time" ng-disabled="disabled"></ngb-timepicker>', {
      time: {hour: 10, minute: 20, second: 0},
      disabled: true,
    });
    expect(inputs(root).every(({disabled}) => disabled)).toBe(true);
    expect(buttons(root).every(({disabled}) => disabled)).toBe(true);
    click(buttons(root)[0]);
    expect(scope.time).toEqual({hour: 10, minute: 20, second: 0});
  });

  it("makes only inputs readonly while spinner buttons stay operational", () => {
    const {scope, root} = setup('<ngb-timepicker ng-model="time" readonly-inputs="true"></ngb-timepicker>', {
      time: {hour: 10, minute: 20, second: 0},
    });
    expect(inputs(root).every(({readOnly}) => readOnly)).toBe(true);
    expect(buttons(root).every(({disabled}) => !disabled)).toBe(true);
    click(buttons(root)[0]);
    expect(scope.time).toEqual({hour: 11, minute: 20, second: 0});
  });

  it("removes spinner buttons when spinners is false", () => {
    const {root} = setup('<ngb-timepicker ng-model="time" spinners="false"></ngb-timepicker>');
    expect(buttons(root)).toHaveLength(0);
  });

  it("does not submit the surrounding form when a spinner is clicked", () => {
    const {root} = setup(
      '<form><ngb-timepicker ng-model="time"></ngb-timepicker><button class="submit" type="submit">Submit</button></form>',
    );
    const form = root as HTMLFormElement;
    const submit = vi.fn((event: Event) => event.preventDefault());
    form.addEventListener("submit", submit);
    click(root.querySelector<HTMLButtonElement>("button.btn-link")!);
    expect(submit).not.toHaveBeenCalled();
  });

  it.each([
    ["small", "form-control-sm", "btn-sm"],
    ["large", "form-control-lg", "btn-lg"],
  ] as const)("applies Bootstrap %s sizing", (size, inputClass, buttonClass) => {
    const {root} = setup(`<ngb-timepicker ng-model="time" size="'${size}'"></ngb-timepicker>`);
    expect(inputs(root).every((input) => input.classList.contains(inputClass))).toBe(true);
    expect(buttons(root).every((button) => button.classList.contains(buttonClass))).toBe(true);
  });

  it("provides labels and hidden spinner descriptions", () => {
    const {root} = setup('<ngb-timepicker ng-model="time" seconds="true"></ngb-timepicker>');
    expect(inputs(root).map((input) => input.getAttribute("aria-label"))).toEqual(["Hours", "Minutes", "Seconds"]);
    expect(Array.from(root.querySelectorAll(".visually-hidden"), ({textContent}) => textContent?.trim())).toEqual([
      "Increment hours",
      "Decrement hours",
      "Increment minutes",
      "Decrement minutes",
      "Increment seconds",
      "Decrement seconds",
    ]);
  });
});
