import angular, { type IAugmentedJQuery, type ICompileService, type IRootScopeService, type IScope } from "angular";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NgbTypeaheadModule } from "./ngb-typeahead.module";
import { NgbTypeaheadWindow } from "./ngb-typeahead-window";

describe("NgbTypeaheadWindow", () => {
  let $compile: ICompileService;
  let $rootScope: IRootScopeService;
  let element: IAugmentedJQuery | undefined;

  beforeEach(() => {
    angular.mock.module(NgbTypeaheadModule.name);
    angular.mock.inject((_$compile_: ICompileService, _$rootScope_: IRootScopeService) => {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    });
  });

  afterEach(() => element?.remove());

  function setup(focusFirst = true, formatter?: (result: string) => string, popupClass?: string) {
    const scope = $rootScope.$new() as IScope & {
      results: string[];
      term: string;
      focusFirst: boolean;
      formatter?: (result: string) => string;
      popupClass?: string;
      selected: ReturnType<typeof vi.fn>;
      activeChanged: ReturnType<typeof vi.fn>;
    };
    scope.results = ["bar", "baz"];
    scope.term = "ba";
    scope.focusFirst = focusFirst;
    scope.formatter = formatter;
    scope.popupClass = popupClass;
    scope.selected = vi.fn();
    scope.activeChanged = vi.fn();
    element = $compile(`
      <ngb-typeahead-window
        id="test-typeahead"
        results="results"
        term="term"
        formatter="formatter"
        popup-class="popupClass"
        focus-first="focusFirst"
        select="selected($event)"
        active-change="activeChanged($event)">
      </ngb-typeahead-window>
    `)(scope);
    angular.element(document.body).append(element);
    scope.$digest();
    return {
      scope,
      root: element[0] as HTMLElement,
      controller: element.controller(NgbTypeaheadWindow.$name) as NgbTypeaheadWindow,
    };
  }

  it("renders results with the first row active", () => {
    const { root } = setup();
    const rows = root.querySelectorAll<HTMLButtonElement>("button");
    expect(Array.from(rows, ({ textContent }) => textContent?.trim())).toEqual(["bar", "baz"]);
    expect(rows[0].classList.contains("active")).toBe(true);
  });

  it("formats results with the supplied formatter", () => {
    const { root } = setup(true, (result) => result.toUpperCase());
    expect(Array.from(root.querySelectorAll("button"), ({ textContent }) => textContent?.trim())).toEqual([
      "BAR",
      "BAZ",
    ]);
  });

  it("moves and wraps the active row", () => {
    const { controller } = setup();
    expect(controller.getActive()).toBe("bar");
    controller.next();
    expect(controller.getActive()).toBe("baz");
    controller.next();
    expect(controller.getActive()).toBe("bar");
    controller.prev();
    expect(controller.getActive()).toBe("baz");
  });

  it("includes the no-active position when focusFirst is false", () => {
    const { controller } = setup(false);
    expect(controller.hasActive()).toBe(false);
    controller.next();
    expect(controller.getActive()).toBe("bar");
    controller.next();
    expect(controller.getActive()).toBe("baz");
    controller.next();
    expect(controller.hasActive()).toBe(false);
    controller.prev();
    expect(controller.getActive()).toBe("baz");
  });

  it("changes the active row on mouseenter", () => {
    const { root, controller } = setup();
    angular.element(root.querySelectorAll<HTMLButtonElement>("button")[1]).triggerHandler("mouseenter");
    expect(controller.getActive()).toBe("baz");
  });

  it("emits the selected result on click", () => {
    const { scope, root } = setup();
    root.querySelectorAll<HTMLButtonElement>("button")[1].click();
    expect(scope.selected).toHaveBeenCalledWith("baz");
  });

  it("uses the real host id for ARIA option ids and active changes", () => {
    const { scope, root, controller } = setup();
    expect(root.id).toBe("test-typeahead");
    expect(root.getAttribute("role")).toBe("listbox");
    expect(Array.from(root.querySelectorAll("button"), ({ id }) => id)).toEqual([
      "test-typeahead-0",
      "test-typeahead-1",
    ]);

    root.id = "changed-at-runtime";
    controller.markActive(1);
    expect(scope.activeChanged).toHaveBeenLastCalledWith("changed-at-runtime-1");
  });

  it("writes id assignments to the host through its setter", () => {
    const { root, controller } = setup();
    controller.id = "assigned-by-popup";
    expect(root.id).toBe("assigned-by-popup");
    expect(controller.id).toBe("assigned-by-popup");
  });

  it("prevents mousedown default so the input can retain focus", () => {
    const { root } = setup();
    const event = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
    root.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it("returns the selected row through getActive and emits no active id when reset without focusFirst", () => {
    const { scope, controller } = setup(false);
    expect(controller.getActive()).toBeUndefined();
    controller.markActive(1);
    expect(controller.getActive()).toBe("baz");
    controller.resetActive();
    expect(controller.hasActive()).toBe(false);
    expect(scope.activeChanged).toHaveBeenLastCalledWith(undefined);
  });

  it("renders result buttons as non-submit buttons with the expected ARIA state", () => {
    const { root } = setup();
    const rows = Array.from(root.querySelectorAll<HTMLButtonElement>("button"));
    expect(rows.every(({ type }) => type === "button")).toBe(true);
    expect(rows.map((row) => row.getAttribute("role"))).toEqual(["option", "option"]);
    expect(rows.map((row) => row.getAttribute("aria-selected"))).toEqual(["true", "false"]);
  });

  it("applies and updates a custom popup class", () => {
    const { scope, root } = setup(true, undefined, "first second");
    expect(root.classList.contains("first")).toBe(true);
    expect(root.classList.contains("second")).toBe(true);
    scope.popupClass = "replacement";
    scope.$digest();
    expect(root.classList.contains("dropdown-menu")).toBe(true);
    expect(root.classList.contains("show")).toBe(true);
    expect(root.classList.contains("replacement")).toBe(true);
  });
});
