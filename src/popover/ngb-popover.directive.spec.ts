import { NgbPopover } from "@ngb/popover/ngb-popover.directive";
import { NgbPopoverModule } from "@ngb/popover/ngb-popover.module";
import type { ICompileService, IPromise, IRootScopeService } from "angular";
import angular from "angular";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("ngbPopover", () => {
  let $compile: ICompileService;
  let $rootScope: IRootScopeService;

  beforeEach(() => {
    angular.mock.module(NgbPopoverModule.name);
    angular.mock.inject((_$compile_: ICompileService, _$rootScope_: IRootScopeService) => {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
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
    if (!settled) throw new Error("Popover opening did not settle");
  }

  it("opens and closes with content and title", async () => {
    const scope = $rootScope.$new();
    const element = $compile(`
      <button
        type="button"
        ngb-popover="'Popover body'"
        popover-title="'Popover title'"
        triggers="'manual'"
        animation="false">
        Toggle
      </button>
    `)(scope);
    angular.element(document.body).append(element);
    scope.$digest();

    const popover = element.controller(NgbPopover.$name) as NgbPopover;
    const opening = popover.open();
    scope.$digest();
    await settle(opening);
    scope.$digest();

    expect(popover.isOpen()).toBe(true);
    expect(document.body.querySelector(".popover-header")?.textContent?.trim()).toBe("Popover title");
    expect(document.body.querySelector(".popover-body")?.textContent).toContain("Popover body");
    expect(element.attr("aria-describedby")).toMatch(/^ngb-popover-/);

    popover.close(false);
    scope.$digest();

    expect(popover.isOpen()).toBe(false);
    expect(element.attr("aria-describedby")).toBeUndefined();
    expect(document.body.querySelector(".popover")).toBeNull();
  });

  it("uses an independent popup instance for each directive", async () => {
    const scope = $rootScope.$new();
    const host = $compile(`
      <div>
        <button type="button" ngb-popover="'First'" triggers="'manual'" animation="false">First</button>
        <button type="button" ngb-popover="'Second'" triggers="'manual'" animation="false">Second</button>
      </div>
    `)(scope);
    angular.element(document.body).append(host);
    scope.$digest();

    const buttons = host.find("button");
    const first = angular.element(buttons[0]).controller(NgbPopover.$name) as NgbPopover;
    const second = angular.element(buttons[1]).controller(NgbPopover.$name) as NgbPopover;

    const firstOpening = first.open();
    const secondOpening = second.open();
    scope.$digest();
    await settle(firstOpening);
    await settle(secondOpening);
    scope.$digest();

    expect(document.body.querySelectorAll(".popover")).toHaveLength(2);

    first.close(false);
    scope.$digest();

    expect(first.isOpen()).toBe(false);
    expect(second.isOpen()).toBe(true);
    expect(document.body.querySelectorAll(".popover")).toHaveLength(1);
    expect(document.body.querySelector(".popover-body")?.textContent).toContain("Second");
  });

  it("opens when only a title is provided", async () => {
    const scope = $rootScope.$new();
    const element = $compile(`
      <button type="button" ngb-popover popover-title="'Title only'" triggers="'manual'" animation="false">
        Open
      </button>
    `)(scope);
    angular.element(document.body).append(element);
    scope.$digest();

    const popover = element.controller(NgbPopover.$name) as NgbPopover;
    const opening = popover.open();
    scope.$digest();
    await settle(opening);
    scope.$digest();

    expect(popover.isOpen()).toBe(true);
    expect(document.body.querySelector(".popover-header")?.textContent?.trim()).toBe("Title only");
  });

  it("renders content and title templates with context", async () => {
    const scope = $rootScope.$new();
    const host = $compile(`
      <div>
        <ng-template ng-ref="contentTemplate" let-name="name">
          <strong class="template-content">Hello {{ name }}</strong>
        </ng-template>
        <ng-template ng-ref="titleTemplate" let-name="name">
          <span class="template-title">Profile for {{ name }}</span>
        </ng-template>
        <button
          type="button"
          ngb-popover="contentTemplate"
          popover-title="titleTemplate"
          popover-context="{ name: 'Ada' }"
          triggers="'manual'"
          animation="false">
          Open
        </button>
      </div>
    `)(scope);
    angular.element(document.body).append(host);
    scope.$digest();

    const button = angular.element(host[0].querySelector("button") as Element);
    const popover = button.controller(NgbPopover.$name) as NgbPopover;
    const opening = popover.open();
    scope.$digest();
    await settle(opening);
    scope.$digest();

    expect(document.body.querySelector(".template-content")?.textContent).toContain("Hello Ada");
    expect(document.body.querySelector(".template-title")?.textContent).toContain("Profile for Ada");
  });

  it("does not open when disabled", async () => {
    const scope = $rootScope.$new();
    const element = $compile(`
      <button type="button" ngb-popover="'Hidden'" disable-popover="true" triggers="'manual'">
        Disabled
      </button>
    `)(scope);
    angular.element(document.body).append(element);
    scope.$digest();

    const popover = element.controller(NgbPopover.$name) as NgbPopover;
    const opening = popover.open();
    scope.$digest();
    await settle(opening);

    expect(popover.isOpen()).toBe(false);
  });
});
