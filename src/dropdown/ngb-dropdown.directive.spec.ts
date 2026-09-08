import { ngbAutoClose } from "@ngb/utils/autoclose";
import type { ICompileService, IRootScopeService } from "angular";
import angular from "angular";
import type { NgZone } from "ngjs-core";
import { Subject } from "rxjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configureTestBed, type NgbTestBed } from "../../test/testbed";
import { NgbModule } from "../ngb.module";
import type { NgbDropdown } from "./ngb-dropdown.directive";

describe("ngbDropdown", () => {
  let tb: NgbTestBed;
  let $compile: ICompileService;
  let $rootScope: IRootScopeService;

  beforeEach(async () => {
    tb = await configureTestBed(NgbModule);
    $compile = tb.$compile;
    $rootScope = tb.$rootScope;
  });

  afterEach(() => tb.destroy());

  it("collects menu items and their disabled state from projected content", () => {
    const scope = $rootScope.$new() as IRootScopeService & { opened: boolean; itemDisabled: boolean };
    scope.opened = true;
    scope.itemDisabled = true;

    const element = $compile(`
            <div ngb-dropdown open="opened" auto-close="'inside'">
                <button type="button" ngb-dropdown-toggle>toggle</button>
                <div ngb-dropdown-menu>
                    <button type="button" class="enabled" ngb-dropdown-item>enabled</button>
                    <button type="button" class="disabled-item" ngb-dropdown-item ng-disabled="itemDisabled">disabled</button>
                </div>
            </div>
        `)(scope);
    angular.element(document.body).append(element);
    tb.detectChanges();

    const root = element[0] as HTMLElement;
    const menu = angular.element(root.querySelector(".dropdown-menu") as Element);
    const dropdown = element.controller("ngbDropdown") as NgbDropdown;

    expect(menu.hasClass("show")).toBe(true);
    expect(dropdown.menuItems).toHaveLength(2);
    expect(dropdown.menuItems.map((item) => item.isDisabled())).toEqual([false, true]);

    scope.itemDisabled = false;
    tb.detectChanges();
    expect(dropdown.menuItems.map((item) => item.isDisabled())).toEqual([false, false]);
    expect(angular.element(root.querySelector(".disabled-item") as Element).hasClass("disabled")).toBe(false);

    dropdown.close();
    tb.detectChanges();
    expect(menu.hasClass("show")).toBe(false);

    element.remove();
  });

  it("focuses first enabled item on ArrowDown and closes on Escape", () => {
    const scope = $rootScope.$new() as IRootScopeService & { opened: boolean };
    scope.opened = true;

    const element = $compile(`
            <div ngb-dropdown open="opened" auto-close="'inside'">
                <button type="button" class="toggle" ngb-dropdown-toggle>toggle</button>
                <div ngb-dropdown-menu>
                    <button type="button" class="first-item" ngb-dropdown-item>first</button>
                    <button type="button" ngb-dropdown-item>second</button>
                </div>
            </div>
        `)(scope);
    angular.element(document.body).append(element);
    tb.detectChanges();

    const root = element[0] as HTMLElement;
    const menu = angular.element(root.querySelector(".dropdown-menu") as Element);
    const toggle = root.querySelector(".toggle") as HTMLElement;
    const firstItem = root.querySelector(".first-item") as HTMLElement;

    toggle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    tb.detectChanges();
    expect(document.activeElement).toBe(firstItem);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    tb.detectChanges();
    expect(menu.hasClass("show")).toBe(false);

    element.remove();
  });

  it("ignores containment entries whose native element is not linked yet", () => {
    const closed = new Subject<void>();
    const ngZone = {
      runOutsideAngular: (callback: () => void) => callback(),
      run: (callback: () => void) => callback(),
    } as unknown as NgZone;

    ngbAutoClose(ngZone, document, true, () => void 0, closed, [undefined as never], [undefined as never]);

    expect(() => document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }))).not.toThrow();
    closed.next();
    closed.complete();
  });

  it("is closed with dropdown classes by default", () => {
    const element = $compile(`
      <div ngb-dropdown><button ngb-dropdown-toggle>Toggle</button><div ngb-dropdown-menu>Menu</div></div>
    `)($rootScope.$new());
    tb.detectChanges();
    expect(element.hasClass("dropdown")).toBe(true);
    expect(element.hasClass("show")).toBe(false);
    expect(element[0].querySelector(".dropdown-menu")?.classList.contains("show")).toBe(false);
    expect(element[0].querySelector("[ngb-dropdown-toggle]")?.getAttribute("aria-expanded")).toBe("false");
  });

  it("toggles on toggle clicks and emits open changes", () => {
    const scope = $rootScope.$new() as IRootScopeService & { onOpen: (open: boolean) => void };
    scope.onOpen = vi.fn();
    const element = $compile(`
      <div ngb-dropdown open-change="onOpen($event)">
        <button ngb-dropdown-toggle><span class="child">Toggle</span></button><div ngb-dropdown-menu>Menu</div>
      </div>
    `)(scope);
    tb.detectChanges();
    (element[0].querySelector(".child") as HTMLElement).click();
    tb.detectChanges();
    expect(element.hasClass("show")).toBe(true);
    expect(scope.onOpen).toHaveBeenLastCalledWith(true);
    (element[0].querySelector("[ngb-dropdown-toggle]") as HTMLElement).click();
    tb.detectChanges();
    expect(element.hasClass("show")).toBe(false);
    expect(scope.onOpen).toHaveBeenLastCalledWith(false);
  });

  it("reacts to its open binding and imperative API", () => {
    const scope = $rootScope.$new() as IRootScopeService & { opened: boolean };
    scope.opened = false;
    const element = $compile(`
      <div ngb-dropdown open="opened"><button ngb-dropdown-toggle>Toggle</button><div ngb-dropdown-menu>Menu</div></div>
    `)(scope);
    tb.detectChanges();
    const dropdown = element.controller<NgbDropdown>("ngbDropdown");
    scope.opened = true;
    tb.detectChanges();
    expect(dropdown.isOpen()).toBe(true);
    dropdown.close();
    expect(dropdown.isOpen()).toBe(false);
    dropdown.open();
    expect(dropdown.isOpen()).toBe(true);
    dropdown.toggle();
    expect(dropdown.isOpen()).toBe(false);
  });

  it("sets disabled semantics and custom tabindex on items", () => {
    const element = $compile(`
      <div ngb-dropdown open="true"><button ngb-dropdown-toggle>Toggle</button><div ngb-dropdown-menu>
        <button ngb-dropdown-item disabled="true">Disabled</button>
        <a ngb-dropdown-item tabindex="7">Custom</a>
      </div></div>
    `)($rootScope.$new());
    tb.detectChanges();
    const items = element[0].querySelectorAll<HTMLElement>("[ngb-dropdown-item]");
    expect(items[0].classList.contains("disabled")).toBe(true);
    expect(items[0].getAttribute("aria-disabled")).toBe("true");
    expect(items[1].getAttribute("tabindex")).toBe("7");
  });

  it("uses dropup class for top placement and preserves custom classes", () => {
    const element = $compile(`
      <div class="custom" ngb-dropdown placement="'top'">
        <button ngb-dropdown-toggle>Toggle</button><div ngb-dropdown-menu>Menu</div>
      </div>
    `)($rootScope.$new());
    tb.detectChanges();
    expect(element.hasClass("dropup")).toBe(true);
    expect(element.hasClass("custom")).toBe(true);
  });
});
