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
                <ul ngb-nav active-id="activeId" animation="false">
                    <li ngb-nav-item="0">
                        <button ngb-nav-link>Home</button>
                        <div ngb-nav-content>Home content</div>
                    </li>
                    <li ngb-nav-item="1">
                        <button ngb-nav-link>Profile</button>
                        <div ngb-nav-content>Profile content</div>
                    </li>
                </ul>
                <div ngb-nav-outlet></div>
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

    angular.element(buttons[1]).triggerHandler("click");
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
                <ul ngb-nav active-id="activeId" active-id-change="onActiveChange($event)" animation="false">
                    <li ngb-nav-item="0">
                        <button ngb-nav-link>Tab A</button>
                        <div ngb-nav-content>Content A</div>
                    </li>
                    <li ngb-nav-item="1">
                        <button ngb-nav-link>Tab B</button>
                        <div ngb-nav-content>Content B</div>
                    </li>
                </ul>
                <div ngb-nav-outlet></div>
            </div>
        `)(scope);
    angular.element(document.body).append(element);
    scope.$digest();

    const secondButton = (element[0] as HTMLElement).querySelectorAll("[ngb-nav-link]")[1] as HTMLElement;
    angular.element(secondButton).triggerHandler("click");
    scope.$digest();

    expect(onActiveChange).toHaveBeenCalledTimes(1);
    expect(onActiveChange).toHaveBeenCalledWith(1);
    element.remove();
  });
});