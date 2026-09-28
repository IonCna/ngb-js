import { NgbModule } from "@ngb/ngb.module";
import type { IAugmentedJQuery, INgModelController, IScope } from "angular";
import { map, type Observable } from "rxjs";
import { TestBed } from "ngjs-core/testing";
import type angular from "angular";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("NgbTypeahead ↔ ngModel (ControlValueAccessor)", () => {
  let element: IAugmentedJQuery | undefined;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [NgbModule] });
  });

  afterEach(() => {
    element?.remove();
  });

  it("pinta el valor del modelo en el input (writeValue via $render)", () => {
    const scope = TestBed.inject<angular.IRootScopeService>("$rootScope").$new() as IScope & Record<string, unknown>;
    scope.search = (text$: Observable<string>) => text$.pipe(map(() => [] as string[]));
    scope.model = "Alaska";
    element = TestBed.inject<angular.ICompileService>("$compile")('<input ng-model="model" ngb-typeahead="search">')(scope);
    scope.$digest();

    expect((element[0] as HTMLInputElement).value).toBe("Alaska");
  });

  it("propaga lo tipeado al modelo (registerOnChange → $setViewValue)", () => {
    const scope = TestBed.inject<angular.IRootScopeService>("$rootScope").$new() as IScope & Record<string, unknown>;
    scope.search = (text$: Observable<string>) => text$.pipe(map(() => [] as string[]));
    scope.model = "";
    element = TestBed.inject<angular.ICompileService>("$compile")('<input ng-model="model" ngb-typeahead="search">')(scope);
    scope.$digest();

    const input = element[0] as HTMLInputElement;
    input.value = "abc";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    scope.$digest();

    expect(scope.model).toBe("abc");
  });

  it("marca $touched en blur (registerOnTouched → $setTouched)", () => {
    const scope = TestBed.inject<angular.IRootScopeService>("$rootScope").$new() as IScope & Record<string, unknown>;
    scope.search = (text$: Observable<string>) => text$.pipe(map(() => [] as string[]));
    scope.model = "";
    element = TestBed.inject<angular.ICompileService>("$compile")('<input ng-model="model" ngb-typeahead="search">')(scope);
    scope.$digest();

    const ngModel = element.controller("ngModel") as INgModelController;
    expect(ngModel.$touched).toBe(false);

    (element[0] as HTMLInputElement).dispatchEvent(new Event("blur"));
    scope.$digest();

    expect(ngModel.$touched).toBe(true);
  });
});
