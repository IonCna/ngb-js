import type { ICompileService, IRootScopeService } from "angular";
import angular from "angular";
import { beforeEach, describe, expect, it } from "vitest";
import { NgbModule } from "../ngb.module";

describe("ngbDropdown", () => {
  let $compile: ICompileService;
  let $rootScope: IRootScopeService;

  beforeEach(() => {
    angular.mock.module(NgbModule.name);
    angular.mock.inject((_$compile_: ICompileService, _$rootScope_: IRootScopeService) => {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    });
  });

  it("keeps menu open when clicking disabled items with inside autoclose", () => {
    const scope = $rootScope.$new() as IRootScopeService & { opened: boolean };
    scope.opened = true;

    const element = $compile(`
            <div ngb-dropdown open="opened" auto-close="'inside'" animation="false">
                <button type="button" ngb-dropdown-toggle>toggle</button>
                <div ngb-dropdown-menu>
                    <button type="button" class="enabled" ngb-dropdown-button-item>enabled</button>
                    <button type="button" class="disabled-item" ngb-dropdown-button-item ngb-disabled="true">disabled</button>
                </div>
            </div>
        `)(scope);
    angular.element(document.body).append(element);
    scope.$digest();

    const root = element[0] as HTMLElement;
    const menu = angular.element(root.querySelector(".dropdown-menu") as Element);
    const disabledItem = angular.element(root.querySelector(".disabled-item") as Element);
    const enabledItem = angular.element(root.querySelector(".enabled") as Element);

    expect(menu.hasClass("show")).toBe(true);

    menu.triggerHandler({
      type: "click",
      target: disabledItem[0],
    } as JQueryEventObject);
    scope.$digest();
    expect(menu.hasClass("show")).toBe(true);
    expect(scope.opened).toBe(true);

    menu.triggerHandler({
      type: "click",
      target: enabledItem[0],
    } as JQueryEventObject);
    scope.$digest();
    expect(menu.hasClass("show")).toBe(false);

    element.remove();
  });

  it("focuses first enabled item on ArrowDown and closes on Escape", () => {
    const scope = $rootScope.$new() as IRootScopeService & { opened: boolean };
    scope.opened = true;

    const element = $compile(`
            <div ngb-dropdown open="opened" auto-close="'inside'" animation="false">
                <button type="button" class="toggle" ngb-dropdown-toggle>toggle</button>
                <div ngb-dropdown-menu>
                    <button type="button" class="first-item" ngb-dropdown-button-item>first</button>
                    <button type="button" ngb-dropdown-button-item>second</button>
                </div>
            </div>
        `)(scope);
    angular.element(document.body).append(element);
    scope.$digest();

    const root = element[0] as HTMLElement;
    const menu = angular.element(root.querySelector(".dropdown-menu") as Element);
    const firstItem = root.querySelector(".first-item") as HTMLElement;
    const $document = angular.element(document);

    menu.triggerHandler({
      type: "keydown",
      key: "ArrowDown",
      preventDefault: () => void 0,
    } as JQueryEventObject);
    scope.$digest();
    expect(document.activeElement).toBe(firstItem);

    $document.triggerHandler({
      type: "keydown",
      key: "Escape",
      preventDefault: () => void 0,
    } as JQueryEventObject);
    scope.$digest();
    expect(menu.hasClass("show")).toBe(false);

    element.remove();
  });
});
