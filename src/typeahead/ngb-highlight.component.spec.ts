import angular, { type IAugmentedJQuery, type ICompileService, type IRootScopeService, type IScope } from "angular";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NgbTypeaheadModule } from "./ngb-typeahead.module";

describe("NgbHighlight", () => {
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

  function setup(result: unknown, term: unknown, highlightClass?: string, accentSensitive?: boolean) {
    const scope = $rootScope.$new() as IScope & Record<string, unknown>;
    Object.assign(scope, { result, term, highlightClass, accentSensitive });
    element = $compile(
      '<ngb-highlight result="result" term="term" highlight-class="highlightClass" accent-sensitive="accentSensitive"></ngb-highlight>',
    )(scope);
    angular.element(document.body).append(element);
    scope.$digest();
    return element[0] as HTMLElement;
  }

  it.each([
    ["foo bar baz", "bar", "foo bar baz", ["bar"]],
    ["foo bAR baz", "bar", "foo bAR baz", ["bAR"]],
    ["foo (bAR baz", "(BAR", "foo (bAR baz", ["(bAR"]],
    ["foobar baz", ["foo", "bar"], "foobar baz", ["foo", "bar"]],
  ])("highlights matches in %s", (result, term, text, matches) => {
    const root = setup(result, term);
    expect(root.textContent).toBe(text);
    expect(Array.from(root.querySelectorAll(".ngb-highlight"), ({ textContent }) => textContent)).toEqual(matches);
    expect(
      Array.from(root.querySelectorAll(".ngb-highlight")).every((part) => part.classList.contains("fw-bold")),
    ).toBe(true);
  });

  it.each([null, undefined, "", []])("does not highlight a blank term (%s)", (term) => {
    const root = setup("123", term);
    expect(root.textContent).toBe("123");
    expect(root.querySelector(".ngb-highlight")).toBeNull();
  });

  it("supports a custom highlight class", () => {
    const root = setup("123", "2", "custom-highlight");
    expect(root.querySelector(".custom-highlight")?.textContent).toBe("2");
    expect(root.querySelector(".ngb-highlight")).toBeNull();
  });

  it("matches without accent sensitivity", () => {
    const root = setup("Noël été", ["noel", "ete"], undefined, false);
    expect(Array.from(root.querySelectorAll(".ngb-highlight"), ({ textContent }) => textContent)).toEqual([
      "Noël",
      "été",
    ]);
  });

  it.each([
    [null, "null", ""],
    [undefined, "undefined", ""],
    [0, "0", "0"],
  ])("stringifies result %s consistently", (result, term, highlighted) => {
    const root = setup(result, term);
    expect(root.textContent).toBe(result == null ? "" : String(result));
    expect(root.querySelector(".ngb-highlight")?.textContent ?? "").toBe(highlighted);
  });

  it("supports mixed string, numeric and null search terms", () => {
    const root = setup("one 2 three", ["one", 2, null]);
    expect(Array.from(root.querySelectorAll(".ngb-highlight"), ({ textContent }) => textContent)).toEqual(["one", "2"]);
  });

  it("keeps accent-sensitive matching enabled by default", () => {
    const root = setup("Noël", "Noel");
    expect(root.querySelector(".ngb-highlight")).toBeNull();
  });
});
