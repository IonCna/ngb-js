import type { ICompileService, IRootScopeService } from "angular";
import angular from "angular";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NgbModule } from "../ngb.module";

describe("ngbNav", () => {
  let $compile: ICompileService;
  let $rootScope: IRootScopeService;

  beforeEach(() => {
    angular.mock.module(NgbModule.name);
    angular.mock.inject((_$compile_: ICompileService, _$rootScope_: IRootScopeService) => {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    });
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

    buttons[1].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    scope.$digest();
    await tick(scope);
    await tick(scope);

    expect(scope.activeId).toBe(1);
    expect(buttons[1].classList.contains("active")).toBe(true);
    expect(outlet.textContent).toContain("Profile content");
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
    (element[0] as HTMLElement).dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "ArrowRight" }));

    expect(document.activeElement).toBe(buttons[1]);
    element.remove();
  });
});
