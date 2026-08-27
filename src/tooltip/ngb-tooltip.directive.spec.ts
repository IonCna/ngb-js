import type { ICompileService, IPromise, IRootScopeService, ITimeoutService } from "angular";
import angular from "angular";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NgbModule } from "../ngb.module";

type MockTimeoutService = ITimeoutService & {
  flush: (delay?: number) => void;
  verifyNoPendingTasks: () => void;
};

describe("ngbTooltip", () => {
  let $compile: ICompileService;
  let $rootScope: IRootScopeService;
  let $timeout: MockTimeoutService;

  beforeEach(() => {
    angular.mock.module(NgbModule.name);
    angular.mock.inject((_$compile_: ICompileService, _$rootScope_: IRootScopeService, _$timeout_: ITimeoutService) => {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $timeout = _$timeout_ as MockTimeoutService;
    });
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  async function settle(promise: IPromise<void>): Promise<void> {
    let settled = false;
    let rejected: unknown;
    promise.then(
      () => {
        settled = true;
      },
      (error) => {
        rejected = error;
      },
    );
    for (let index = 0; index < 20; index++) {
      $rootScope.$digest();
      await Promise.resolve();
    }
    if (rejected) throw rejected;
    if (!settled) throw new Error("Tooltip opening did not settle");
  }

  it("opens and closes tooltip via controller api", async () => {
    const scope = $rootScope.$new() as IRootScopeService & {
      shown: () => void;
      hidden: () => void;
    };
    scope.shown = () => void 0;
    scope.hidden = () => void 0;

    const element = $compile(`
            <button
                type="button"
                ngb-tooltip="'Tooltip text'"
                open-delay="0"
                close-delay="0"
                animation="false"
                shown="shown()"
                hidden="hidden()">
                Toggle
            </button>
        `)(scope);
    angular.element(document.body).append(element);
    scope.$digest();

    expect(document.body.querySelector(".tooltip")).toBeNull();

    const ctrl = element.controller("ngbTooltip") as {
      open: () => IPromise<void>;
      close: () => void;
    };
    const opening = ctrl.open();
    scope.$digest();
    await settle(opening);
    scope.$digest();
    $timeout.flush();
    scope.$digest();

    expect((ctrl as { isOpen: () => boolean }).isOpen()).toBe(true);
    expect(document.body.querySelector(".tooltip-inner")?.textContent).toContain("Tooltip text");

    ctrl.close();
    scope.$digest();

    expect((ctrl as { isOpen: () => boolean }).isOpen()).toBe(false);
    element.remove();
  });

  it("does not open when disabled", () => {
    const scope = $rootScope.$new();
    const element = $compile(`
            <button
                type="button"
                ngb-tooltip="'Hidden tooltip'"
                triggers="'click'"
                disable-tooltip="true"
                open-delay="0"
                animation="false">
                Disabled
            </button>
        `)(scope);
    angular.element(document.body).append(element);
    scope.$digest();

    element.triggerHandler("click");
    scope.$digest();

    expect(document.body.querySelector(".tooltip")).toBeNull();
    element.remove();
  });

  it("renders a TemplateRef with the provided tooltip context", async () => {
    const scope = $rootScope.$new();
    const host = $compile(`
      <div>
        <ng-template ng-ref="tooltipTpl" let-name="name">
          <strong class="template-tooltip">Hello {{ name }}</strong>
        </ng-template>
        <button
          type="button"
          ngb-tooltip="tooltipTpl"
          tooltip-context="{ name: 'ngjs-core' }"
          animation="false">
          Open template
        </button>
      </div>
    `)(scope);
    angular.element(document.body).append(host);
    scope.$digest();

    const button = angular.element(host[0].querySelector("button") as Element);
    const tooltip = button.controller("ngbTooltip") as { open: (context?: { name: string }) => IPromise<void> };
    const opening = tooltip.open({ name: "ngjs-core" });
    scope.$digest();
    await settle(opening);
    scope.$digest();
    $timeout.flush();
    scope.$digest();

    expect(document.body.querySelector(".template-tooltip")?.textContent).toContain("Hello ngjs-core");
  });

  it("reopens when hovering again during the closing transition", async () => {
    const scope = $rootScope.$new();
    const element = $compile(`
            <button
                type="button"
                ngb-tooltip="'Fast tooltip'"
                open-delay="0"
                close-delay="0">
                Fast
            </button>
        `)(scope);
    angular.element(document.body).append(element);
    scope.$digest();

    const ctrl = element.controller("ngbTooltip") as { isOpen: () => boolean };
    const button = element[0];

    button.dispatchEvent(new MouseEvent("mouseenter"));
    await Promise.resolve();
    await Promise.resolve();
    scope.$digest();
    $timeout.flush();

    button.dispatchEvent(new MouseEvent("mouseleave"));
    button.dispatchEvent(new MouseEvent("mouseenter"));
    await Promise.resolve();
    await Promise.resolve();
    scope.$digest();
    $timeout.flush();
    scope.$digest();

    expect(ctrl.isOpen()).toBe(true);
    expect(document.body.querySelector(".tooltip-inner")?.textContent).toContain("Fast tooltip");
    element.remove();
  });

  it("opens the next tooltip when moving quickly between hosts", async () => {
    const scope = $rootScope.$new();
    const elements = $compile(`
            <div>
                <button type="button" ngb-tooltip="'First tooltip'" open-delay="0" close-delay="0">First</button>
                <button type="button" ngb-tooltip="'Second tooltip'" open-delay="0" close-delay="0">Second</button>
            </div>
        `)(scope);
    angular.element(document.body).append(elements);
    scope.$digest();

    const [first, second] = Array.from(elements[0].querySelectorAll("button"));

    first.dispatchEvent(new MouseEvent("mouseenter"));
    await new Promise((resolve) => setTimeout(resolve, 0));
    scope.$digest();
    $timeout.flush();

    first.dispatchEvent(new MouseEvent("mouseleave"));
    second.dispatchEvent(new MouseEvent("mouseenter"));
    await new Promise((resolve) => setTimeout(resolve, 0));
    scope.$digest();
    $timeout.flush();
    scope.$digest();

    const tooltipTexts = Array.from(document.body.querySelectorAll(".tooltip-inner")).map(
      (tooltip) => tooltip.textContent,
    );
    expect(tooltipTexts).toContain("Second tooltip");
    expect(document.body.querySelector(".tooltip.show .tooltip-inner")?.textContent).toContain("Second tooltip");
    elements.remove();
  });

  it("supports literal attribute values without expression bindings", async () => {
    const scope = $rootScope.$new();
    const element = $compile(`
            <button
                type="button"
                ngb-tooltip="Tooltip"
                open-delay="0"
                close-delay="0"
                animation="false">
                Literal
            </button>
        `)(scope);
    angular.element(document.body).append(element);
    scope.$digest();

    const ctrl = element.controller("ngbTooltip") as {
      open: () => IPromise<void>;
      isOpen: () => boolean;
    };
    const opening = ctrl.open();
    scope.$digest();
    await settle(opening);
    scope.$digest();
    $timeout.flush();
    scope.$digest();

    expect(ctrl.isOpen()).toBe(true);
    element.remove();
  });
});
