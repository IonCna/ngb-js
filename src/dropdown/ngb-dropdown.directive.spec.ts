import { ngbAutoClose } from "@ngb/utils/autoclose";
import type { ICompileService, IRootScopeService } from "angular";
import angular from "angular";
import type { NgZone } from "ngjs-core";
import { Subject } from "rxjs";
import { beforeEach, describe, expect, it } from "vitest";
import { NgbModule } from "../ngb.module";
import { NgbDropdown } from "./ngb-dropdown.directive";

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

  it("collects menu items and their disabled state from projected content", () => {
    const scope = $rootScope.$new() as IRootScopeService & { opened: boolean };
    scope.opened = true;

    const element = $compile(`
            <div ngb-dropdown open="opened" auto-close="'inside'" animation="false">
                <button type="button" ngb-dropdown-toggle>toggle</button>
                <div ngb-dropdown-menu>
                    <button type="button" class="enabled" ngb-dropdown-item>enabled</button>
                    <button type="button" class="disabled-item" ngb-dropdown-item disabled="true">disabled</button>
                </div>
            </div>
        `)(scope);
    angular.element(document.body).append(element);
    scope.$digest();

    const root = element[0] as HTMLElement;
    const menu = angular.element(root.querySelector(".dropdown-menu") as Element);
    const dropdown = element.controller<NgbDropdown>(NgbDropdown.$name);

    expect(menu.hasClass("show")).toBe(true);
    expect(dropdown.menuItems).toHaveLength(2);
    expect(dropdown.menuItems.map(({ disabled }) => disabled)).toEqual([false, true]);

    dropdown.close();
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
                    <button type="button" class="first-item" ngb-dropdown-item>first</button>
                    <button type="button" ngb-dropdown-item>second</button>
                </div>
            </div>
        `)(scope);
    angular.element(document.body).append(element);
    scope.$digest();

    const root = element[0] as HTMLElement;
    const menu = angular.element(root.querySelector(".dropdown-menu") as Element);
    const toggle = angular.element(root.querySelector(".toggle") as Element);
    const firstItem = root.querySelector(".first-item") as HTMLElement;

    toggle.triggerHandler({
      type: "keydown",
      key: "ArrowDown",
      target: toggle[0],
      preventDefault: () => void 0,
    } as JQueryEventObject);
    scope.$digest();
    expect(document.activeElement).toBe(firstItem);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    scope.$digest();
    expect(menu.hasClass("show")).toBe(false);

    element.remove();
  });

  it("ignores containment entries whose native element is not linked yet", () => {
    const closed = new Subject<void>();
    const ngZone = {
      runOutsideAngular: (callback: () => void) => callback(),
      run: (callback: () => void) => callback(),
    } as unknown as NgZone;

    ngbAutoClose(ngZone, true, closed, () => void 0, [undefined], [undefined]);

    expect(() => document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }))).not.toThrow();
    closed.next();
    closed.complete();
  });
});
