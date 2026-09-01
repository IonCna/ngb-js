import { NgbTypeahead } from "@ngb/typeahead/ngb-typeahead.directive";
import { NgbTypeaheadModule } from "@ngb/typeahead/ngb-typeahead.module";
import angular, { type IAugmentedJQuery, type ICompileService, type IRootScopeService, type IScope } from "angular";
import { of } from "rxjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("NgbTypeahead", () => {
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

  it("renders results from the first emission", async () => {
    const scope = $rootScope.$new() as IScope & Record<string, unknown>;
    scope.search = () => of(["Alaska", "Alabama"]);
    element = $compile('<input ng-model="model" ngb-typeahead="search">')(scope);
    angular.element(document.body).append(element);
    scope.$digest();

    const input = element[0] as HTMLInputElement;
    input.value = "ala";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    scope.$digest();
    const controller = element.controller(NgbTypeahead.$name) as unknown as {
      _windowRef?: { location: { nativeElement: HTMLElement } };
    };

    await vi.waitFor(() => {
      scope.$digest();
      const popup = controller._windowRef?.location.nativeElement;
      expect(Array.from(popup?.querySelectorAll("button") ?? [], ({ textContent }) => textContent?.trim())).toEqual([
        "Alaska",
        "Alabama",
      ]);
    });

    scope.$destroy();
  });
});
