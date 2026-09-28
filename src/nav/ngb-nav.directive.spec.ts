import type { ICompileService, IRootScopeService } from "angular";
import angular from "angular";
import { TestBed } from "ngjs-core/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NgbModule } from "../ngb.module";
import { createKeyEvent } from "../test/common";
import { Key } from "../utils/key";

describe("ngbNav", () => {
  let $compile: ICompileService;
  let $rootScope: IRootScopeService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [NgbModule] });
    $compile = TestBed.inject<ICompileService>("$compile");
    $rootScope = TestBed.inject<IRootScopeService>("$rootScope");
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  const tick = async (scope: IRootScopeService) => {
    await Promise.resolve();
    scope.$digest();
  };

  it("renders first tab as active and updates outlet on click", async () => {
    const scope = $rootScope.$new() as IRootScopeService & { activeId: number };
    scope.activeId = 0;

    const element = $compile(`
            <div>
                <ul ngb-nav ng-ref="nav" ng-ref-read="ngbNav" active-id="activeId" active-id-change="activeId = $event" animation="false">
                    <li ngb-nav-item="0">
                        <button ngb-nav-link>Home</button>
                        <ng-template ngb-nav-content>Home content</ng-template>
                    </li>
                    <li ngb-nav-item="1">
                        <button ngb-nav-link>Profile</button>
                        <ng-template ngb-nav-content>Profile content</ng-template>
                    </li>
                </ul>
                <div ngb-nav-outlet="nav"></div>
            </div>
        `)(scope);
    angular.element(document.body).append(element);
    scope.$digest();

    const root = element[0] as HTMLElement;
    const nav = root.querySelector("[ngb-nav]") as HTMLElement;
    const buttons = root.querySelectorAll("[ngb-nav-link]") as NodeListOf<HTMLElement>;
    const outlet = root.querySelector("[ngb-nav-outlet]") as HTMLElement;

    expect(nav.classList.contains("nav")).toBe(true);
    expect(nav.getAttribute("role")).toBe("tablist");
    expect(buttons[0].classList.contains("active")).toBe(true);
    expect(outlet.textContent).toContain("Home content");
    await tick(scope);
    // Sin `show active` el pane queda oculto por el CSS de Bootstrap (`.tab-pane:not(.active)`).
    expect(outlet.querySelector(".tab-pane")?.classList.contains("active")).toBe(true);
    expect(outlet.querySelector(".tab-pane")?.classList.contains("show")).toBe(true);

    buttons[1].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    scope.$digest();
    await tick(scope);
    await tick(scope);

    expect(scope.activeId).toBe(1);
    expect(buttons[1].classList.contains("active")).toBe(true);
    expect(outlet.textContent).toContain("Profile content");
    element.remove();
  });

  it("shows the initially active pane (show + active) with animations on and the outlet outside the nav", async () => {
    const scope = $rootScope.$new() as IRootScopeService & { example: { activeId: string } };
    scope.example = { activeId: "b" };
    const element = $compile(`
      <div>
        <nav ngb-nav ng-ref="example.nav" ng-ref-read="ngbNav" active-id="example.activeId" animation="true">
          <div ngb-nav-item="'a'"><button type="button" ngb-nav-link>A</button><ng-template ngb-nav-content>Content A</ng-template></div>
          <div ngb-nav-item="'b'"><button type="button" ngb-nav-link>B</button><ng-template ngb-nav-content>Content B</ng-template></div>
        </nav>
        <div ngb-nav-outlet="example.nav"></div>
      </div>
    `)(scope);
    angular.element(document.body).append(element);
    scope.$digest();
    await tick(scope);

    const pane = element[0].querySelector(".tab-pane") as HTMLElement;
    expect(pane.textContent).toContain("Content B");
    expect(pane.classList.contains("fade")).toBe(true);
    expect(pane.classList.contains("show")).toBe(true);
    expect(pane.classList.contains("active")).toBe(true);
    element.remove();
  });

  it("emits activeIdChange callback when selecting another tab", () => {
    const scope = $rootScope.$new() as IRootScopeService & {
      activeId: number;
      onActiveChange: (id: number) => void;
    };
    scope.activeId = 0;
    const onActiveChange = vi.fn();
    scope.onActiveChange = onActiveChange;

    const element = $compile(`
            <div>
                <ul ngb-nav ng-ref="nav" ng-ref-read="ngbNav" active-id="activeId" active-id-change="onActiveChange($event)" animation="false">
                    <li ngb-nav-item="0">
                        <button ngb-nav-link>Tab A</button>
                        <ng-template ngb-nav-content>Content A</ng-template>
                    </li>
                    <li ngb-nav-item="1">
                        <button ngb-nav-link>Tab B</button>
                        <ng-template ngb-nav-content>Content B</ng-template>
                    </li>
                </ul>
                <div ngb-nav-outlet="nav"></div>
            </div>
        `)(scope);
    angular.element(document.body).append(element);
    scope.$digest();

    const secondButton = (element[0] as HTMLElement).querySelectorAll("[ngb-nav-link]")[1] as HTMLElement;
    secondButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    scope.$digest();

    expect(onActiveChange).toHaveBeenCalledTimes(1);
    expect(onActiveChange).toHaveBeenCalledWith(1);
    element.remove();
  });

  it("exports its controller through ng-ref-read", () => {
    const scope = $rootScope.$new() as IRootScopeService & {
      refs: { nav?: { select(id: string): void } };
      activeId: string;
    };
    scope.refs = {};
    scope.activeId = "first";

    const element = $compile(`
      <div>
        <ul ngb-nav ng-ref="refs.nav" ng-ref-read="ngbNav" active-id="activeId" active-id-change="activeId = $event" animation="false">
          <li ngb-nav-item="'first'">
            <button ngb-nav-link>First</button>
            <ng-template ngb-nav-content>First content</ng-template>
          </li>
          <li ngb-nav-item="'second'">
            <button ngb-nav-link>Second</button>
            <ng-template ngb-nav-content>Second content</ng-template>
          </li>
        </ul>
        <div ngb-nav-outlet="refs.nav"></div>
      </div>
    `)(scope);
    scope.$digest();

    expect(scope.refs.nav).toBeDefined();
    scope.refs.nav?.select("second");
    scope.$digest();

    expect(scope.activeId).toBe("second");
    expect((element[0] as HTMLElement).querySelector("[ngb-nav-outlet]")?.textContent).toContain("Second content");
    element.remove();
  });

  it("queries button links through the NgbNavLinkBase inheritance token", () => {
    const scope = $rootScope.$new() as IRootScopeService & { activeId: string };
    scope.activeId = "first";

    const element = $compile(`
      <ul ngb-nav active-id="activeId" animation="false">
        <li ngb-nav-item="'first'"><button ngb-nav-link>First</button></li>
        <li ngb-nav-item="'second'"><button ngb-nav-link>Second</button></li>
      </ul>
    `)(scope);
    angular.element(document.body).append(element);
    scope.$digest();

    const buttons = (element[0] as HTMLElement).querySelectorAll("button");
    (buttons[0] as HTMLElement).focus();
    (element[0] as HTMLElement).dispatchEvent(createKeyEvent(Key.ArrowRight, { type: "keydown" }));

    expect(document.activeElement).toBe(buttons[1]);
    element.remove();
  });

  it("selects the first item when activeId is omitted", () => {
    const scope = $rootScope.$new() as IRootScopeService & { selected?: string };
    const element = $compile(`
      <ul ngb-nav active-id-change="selected = $event" animation="false">
        <li ngb-nav-item="'first'"><button ngb-nav-link>First</button></li>
        <li ngb-nav-item="'second'"><button ngb-nav-link>Second</button></li>
      </ul>
    `)(scope);
    scope.$digest();
    expect(scope.selected).toBe("first");
    expect(element[0].querySelector("button")?.classList.contains("active")).toBe(true);
  });

  it("applies vertical orientation and can disable tab roles", () => {
    const element = $compile(`
      <ul ngb-nav orientation="'vertical'" roles="false" animation="false">
        <li ngb-nav-item="'first'"><button ngb-nav-link>First</button></li>
      </ul>
    `)($rootScope.$new());
    $rootScope.$digest();
    expect(element.hasClass("flex-column")).toBe(true);
    expect(element.attr("role")).toBeUndefined();
    expect(element.attr("aria-orientation")).toBeUndefined();
    expect(element[0].querySelector("button")?.getAttribute("role")).toBeNull();
  });

  it("sets disabled item classes and ARIA attributes and ignores clicks", () => {
    const scope = $rootScope.$new() as IRootScopeService & { activeId: string };
    scope.activeId = "first";
    const element = $compile(`
      <ul ngb-nav active-id="activeId" active-id-change="activeId = $event" animation="false">
        <li ngb-nav-item="'first'"><button ngb-nav-link>First</button></li>
        <li ngb-nav-item="'second'" disabled="true"><button ngb-nav-link>Second</button></li>
      </ul>
    `)(scope);
    scope.$digest();
    const second = element[0].querySelectorAll<HTMLElement>("button")[1];
    expect(second.classList.contains("disabled")).toBe(true);
    expect(second.getAttribute("aria-disabled")).toBe("true");
    second.click();
    scope.$digest();
    expect(scope.activeId).toBe("first");
  });

  it("allows navChange to cancel user selection", () => {
    const scope = $rootScope.$new() as IRootScopeService & {
      activeId: string;
      cancel: (event: { preventDefault(): void }) => void;
    };
    scope.activeId = "first";
    scope.cancel = vi.fn((event) => event.preventDefault());
    const element = $compile(`
      <ul ngb-nav active-id="activeId" active-id-change="activeId = $event" nav-change="cancel($event)" animation="false">
        <li ngb-nav-item="'first'"><button ngb-nav-link>First</button></li>
        <li ngb-nav-item="'second'"><button ngb-nav-link>Second</button></li>
      </ul>
    `)(scope);
    scope.$digest();
    element[0].querySelectorAll<HTMLElement>("button")[1].click();
    scope.$digest();
    expect(scope.cancel).toHaveBeenCalledOnce();
    expect(scope.activeId).toBe("first");
  });

  it.each([
    ["ArrowRight", Key.ArrowRight, 1],
    ["ArrowLeft", Key.ArrowLeft, 2],
    ["Home", Key.Home, 0],
    ["End", Key.End, 2],
  ])("moves focus with %s while skipping disabled tabs", (_name, key, expectedIndex) => {
    const element = $compile(`
      <ul ngb-nav animation="false">
        <li ngb-nav-item="'first'"><button ngb-nav-link>First</button></li>
        <li ngb-nav-item="'second'"><button ngb-nav-link>Second</button></li>
        <li ngb-nav-item="'disabled'" disabled="true"><button ngb-nav-link>Disabled</button></li>
      </ul>
    `)($rootScope.$new());
    angular.element(document.body).append(element);
    $rootScope.$digest();
    const buttons = element[0].querySelectorAll<HTMLElement>("button");
    buttons[0].focus();
    element[0].dispatchEvent(createKeyEvent(key, { type: "keydown" }));
    const expected = expectedIndex === 2 ? buttons[1] : buttons[expectedIndex];
    expect(document.activeElement).toBe(expected);
  });
});
