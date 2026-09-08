import type { ICompileService, IRootScopeService } from "angular";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { configureTestBed, type NgbTestBed } from "../../test/testbed";
import { NgbModule } from "../ngb.module";

describe("ngbAccordion", () => {
  let tb: NgbTestBed;
  let $compile: ICompileService;
  let $rootScope: IRootScopeService;

  beforeEach(async () => {
    tb = await configureTestBed(NgbModule);
    $compile = tb.$compile;
    $rootScope = tb.$rootScope;
    tb.get<{ animation: boolean }>("ngb.config.service").animation = false;
  });

  afterEach(() => tb.destroy());

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
    tb.detectChanges();

    expect(element.hasClass("accordion")).toBe(true);

    const buttons = element[0].querySelectorAll("button[ngb-accordion-button]");
    expect(buttons[0]?.getAttribute("aria-expanded")).toBe("true");
    expect(buttons[1]?.getAttribute("aria-expanded")).toBe("false");

    buttons[1].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    tb.detectChanges();

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
    tb.detectChanges();

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

    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    tb.detectChanges();

    expect(collapse.querySelector(".measured-body")).not.toBeNull();
    expect(collapse.style.height).toBe("42px");
  });
});
