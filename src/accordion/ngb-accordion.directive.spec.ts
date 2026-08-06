import type { ICompileService, IProvideService, IRootScopeService } from "angular";
import angular from "angular";
import { beforeEach, describe, expect, it } from "vitest";
import { NgbModule } from "../ngb.module";

describe("ngbAccordion", () => {
  let $compile: ICompileService;
  let $rootScope: IRootScopeService;

  beforeEach(() => {
    angular.mock.module(NgbModule.name);
    angular.mock.module(($provide: IProvideService) => {
      $provide.value("ngb.config.service", { animation: false });
    });
    angular.mock.inject((_$compile_: ICompileService, _$rootScope_: IRootScopeService) => {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    });
  });

  it("respects close-others when toggling items", () => {
    const scope = $rootScope.$new() as IRootScopeService & {
      firstCollapsed: boolean;
      secondCollapsed: boolean;
    };

    scope.firstCollapsed = false;
    scope.secondCollapsed = true;

    const element = $compile(`
            <div ngb-accordion close-others="true" animation="false">
                <div ngb-accordion-item="'first'" collapsed="firstCollapsed">
                    <h2 ngb-accordion-header>
                        <button ngb-accordion-button>First</button>
                    </h2>
                    <div ngb-accordion-collapse>
                        <div ngb-accordion-body>First body</div>
                    </div>
                </div>
                <div ngb-accordion-item="'second'" collapsed="secondCollapsed">
                    <h2 ngb-accordion-header>
                        <button ngb-accordion-button>Second</button>
                    </h2>
                    <div ngb-accordion-collapse>
                        <div ngb-accordion-body>Second body</div>
                    </div>
                </div>
            </div>
        `)(scope);
    scope.$digest();

    expect(element.hasClass("accordion")).toBe(true);

    const buttons = element[0].querySelectorAll("button[ngb-accordion-button]");
    expect(buttons[0]?.getAttribute("aria-expanded")).toBe("true");
    expect(buttons[1]?.getAttribute("aria-expanded")).toBe("false");

    angular.element(buttons[1]).triggerHandler("click");
    scope.$digest();

    expect(buttons[0]?.getAttribute("aria-expanded")).toBe("false");
    expect(buttons[1]?.getAttribute("aria-expanded")).toBe("true");
  });

  it("inserts the body before measuring an expanding collapse", () => {
    const scope = $rootScope.$new() as IRootScopeService & { collapsed: boolean };
    scope.collapsed = true;

    const element = $compile(`
      <div ngb-accordion animation="true" destroy-on-hide="true">
        <div ngb-accordion-item="'measured'" collapsed="collapsed">
          <h2 ngb-accordion-header>
            <button ngb-accordion-button>Toggle</button>
          </h2>
          <div ngb-accordion-collapse>
            <div ngb-accordion-body>
              <ng-template><span class="measured-body">Measured body</span></ng-template>
            </div>
          </div>
        </div>
      </div>
    `)(scope);
    scope.$digest();

    const collapse = element[0].querySelector<HTMLElement>(".accordion-collapse");
    expect(collapse).not.toBeNull();
    if (!collapse) return;

    collapse.getBoundingClientRect = () =>
      ({
        bottom: 42,
        height: collapse.querySelector(".measured-body") ? 42 : 0,
        left: 0,
        right: 100,
        top: 0,
        width: 100,
        x: 0,
        y: 0,
        toJSON: () => undefined,
      }) as DOMRect;

    const button = element[0].querySelector("button");
    expect(button).not.toBeNull();
    if (!button) return;

    angular.element(button).triggerHandler("click");
    scope.$digest();

    expect(collapse.querySelector(".measured-body")).not.toBeNull();
    expect(collapse.style.height).toBe("42px");
  });
});
