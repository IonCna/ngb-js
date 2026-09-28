import { NgbTypeahead } from "@ngb/typeahead/ngb-typeahead.directive";
import type { ICompileService, IRootScopeService } from "angular";
import { TestBed } from "ngjs-core/testing";
import type angular from "angular";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NgbModule } from "../ngb.module";

describe("NgbTypeaheadModule", () => {
  let $compile: ICompileService;
  let $rootScope: IRootScopeService;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [NgbModule] });
    $compile = TestBed.inject<angular.ICompileService>("$compile");
    $rootScope = TestBed.inject<angular.IRootScopeService>("$rootScope");
  });

  
  it("registers the typeahead directive with all of its providers", () => {
    const scope = $rootScope.$new();
    const element = $compile('<input type="text" ng-model="model" ngb-typeahead>')(scope);

    scope.$digest();

    expect(element.controller("ngbTypeahead")).toBeInstanceOf(NgbTypeahead);

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
