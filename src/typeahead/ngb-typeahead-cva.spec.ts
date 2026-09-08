import { NgbModule } from "@ngb/ngb.module";
import type { IAugmentedJQuery, INgModelController, IScope } from "angular";
import { of } from "rxjs";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { configureTestBed, type NgbTestBed } from "../../test/testbed";

describe("NgbTypeahead ↔ ngModel (ControlValueAccessor)", () => {
  let tb: NgbTestBed;
  let element: IAugmentedJQuery | undefined;

  beforeEach(async () => {
    tb = await configureTestBed(NgbModule);
  });

  afterEach(() => {
    element?.remove();
    tb.destroy();
  });

  it("pinta el valor del modelo en el input (writeValue via $render)", () => {
    const scope = tb.$rootScope.$new() as IScope & Record<string, unknown>;
    scope.search = () => of<string[]>([]);
    scope.model = "Alaska";
    element = tb.$compile('<input ng-model="model" ngb-typeahead="search">')(scope);
    scope.$digest();

    expect((element[0] as HTMLInputElement).value).toBe("Alaska");
  });

  it("propaga lo tipeado al modelo (registerOnChange → $setViewValue)", () => {
    const scope = tb.$rootScope.$new() as IScope & Record<string, unknown>;
    scope.search = () => of<string[]>([]);
    scope.model = "";
    element = tb.$compile('<input ng-model="model" ngb-typeahead="search">')(scope);
    scope.$digest();

    const input = element[0] as HTMLInputElement;
    input.value = "abc";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    scope.$digest();

    expect(scope.model).toBe("abc");
  });

  it("marca $touched en blur (registerOnTouched → $setTouched)", () => {
    const scope = tb.$rootScope.$new() as IScope & Record<string, unknown>;
    scope.search = () => of<string[]>([]);
    scope.model = "";
    element = tb.$compile('<input ng-model="model" ngb-typeahead="search">')(scope);
    scope.$digest();

    const ngModel = element.controller("ngModel") as INgModelController;
    expect(ngModel.$touched).toBe(false);

    (element[0] as HTMLInputElement).dispatchEvent(new Event("blur"));
    scope.$digest();

    expect(ngModel.$touched).toBe(true);
  });
});
