import { NgbTypeahead } from "@ngb/typeahead/ngb-typeahead.directive";
import { NgbTypeaheadModule } from "@ngb/typeahead/ngb-typeahead.module";
import type { ICompileService, IRootScopeService } from "angular";
import angular from "angular";
import { beforeEach, describe, expect, it } from "vitest";

describe("NgbTypeaheadModule", () => {
  let $compile: ICompileService;
  let $rootScope: IRootScopeService;

  beforeEach(() => {
    angular.mock.module(NgbTypeaheadModule.name);
    angular.mock.inject((_$compile_: ICompileService, _$rootScope_: IRootScopeService) => {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    });
  });

  it("registers the typeahead directive with all of its providers", () => {
    const scope = $rootScope.$new();
    const element = $compile('<input type="text" ng-model="model" ngb-typeahead>')(scope);

    scope.$digest();

    expect(element.controller(NgbTypeahead.$name)).toBeInstanceOf(NgbTypeahead);

    element.remove();
    scope.$destroy();
  });

  it("exports the highlight component", () => {
    const scope = $rootScope.$new();
    const element = $compile(`<ngb-highlight result="'Alaska'" term="'as'"></ngb-highlight>`)(scope);

    scope.$digest();

    expect(element.text()).toBe("Alaska");
    expect(element[0].querySelector(".ngb-highlight")?.textContent).toBe("as");

    element.remove();
    scope.$destroy();
  });
});
