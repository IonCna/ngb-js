import type { ICompileService, IRootScopeService } from "angular";
import angular from "angular";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NgbModule } from "../ngb.module";
import type { NgbRating } from "./ngb-rating.component";

describe("ngbRating", () => {
  let $compile: ICompileService;
  let $rootScope: IRootScopeService;

  beforeEach(() => {
    angular.mock.module(NgbModule.name);
    angular.mock.inject((_$compile_: ICompileService, _$rootScope_: IRootScopeService) => {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    });
  });

  it("renders the configured number of stars with the correct aria attributes", () => {
    const scope = $rootScope.$new();

    const element = $compile(`<ngb-rating rate="3" max="5"></ngb-rating>`)(scope);
    scope.$digest();

    const stars = element[0].querySelectorAll(":scope > span");
    expect(stars.length).toBe(5);
    expect(Array.from(stars, (star) => star.querySelector("span:last-child")?.textContent?.trim())).toEqual([
      "★",
      "★",
      "★",
      "☆",
      "☆",
    ]);

    expect(element.attr("role")).toBe("slider");
    expect(element.attr("aria-valuemin")).toBe("0");
    expect(element.attr("aria-valuemax")).toBe("5");
    expect(element.attr("aria-valuenow")).toBe("3");
  });

  it("updates the rate when a star is clicked and emits rateChange", () => {
    const scope = $rootScope.$new() as IRootScopeService & { onRateChange: (value: number) => void };
    const onRateChange = vi.fn();
    scope.onRateChange = onRateChange;

    const element = $compile(`<ngb-rating rate="2" max="5" rate-change="onRateChange($event)"></ngb-rating>`)(scope);
    scope.$digest();

    const fourthStar = element[0].querySelectorAll(":scope > span")[3].querySelector("span:last-child") as HTMLElement;
    angular.element(fourthStar).triggerHandler("click");
    scope.$digest();

    expect(element.attr("aria-valuenow")).toBe("4");
    expect(onRateChange).toHaveBeenCalledWith(4);
    expect(
      Array.from(element[0].querySelectorAll(":scope > span"), (star) =>
        star.querySelector("span:last-child")?.textContent?.trim(),
      ),
    ).toEqual(["★", "★", "★", "★", "☆"]);
  });

  it("does not change the rate when disabled", () => {
    const scope = $rootScope.$new() as IRootScopeService & { disabled: boolean };
    scope.disabled = true;

    const element = $compile(`<ngb-rating rate="2" max="5" disabled="disabled"></ngb-rating>`)(scope);
    scope.$digest();

    const fourthStar = element[0].querySelectorAll(":scope > span")[3].querySelector("span:last-child") as HTMLElement;
    angular.element(fourthStar).triggerHandler("click");
    scope.$digest();

    expect(element.attr("aria-valuenow")).toBe("2");
    expect(element.attr("aria-disabled")).toBe("true");

    scope.disabled = false;
    scope.$digest();
    expect(element.attr("aria-disabled")).toBeUndefined();
  });

  it("renders a projected star TemplateRef with its outlet context", () => {
    const scope = $rootScope.$new();
    const element = $compile(`
      <ngb-rating rate="1.5" max="2">
        <ng-template let-fill="fill" let-index="index">
          <strong class="custom-star">{{ index }}:{{ fill }}</strong>
        </ng-template>
      </ngb-rating>
    `)(scope);
    scope.$digest();

    const stars = element[0].querySelectorAll(".custom-star");
    expect(stars).toHaveLength(2);
    expect(stars[0].textContent?.trim()).toBe("0:100");
    expect(stars[1].textContent?.trim()).toBe("1:50");

    const secondStar = element[0].querySelectorAll(":scope > span")[1].querySelector("span:last-child") as HTMLElement;
    angular.element(secondStar).triggerHandler("click");
    scope.$digest();

    expect(Array.from(element[0].querySelectorAll(".custom-star"), (star) => star.textContent?.trim())).toEqual([
      "0:100",
      "1:100",
    ]);
  });

  it("renders ten stars by default and reacts to max changes", () => {
    const scope = $rootScope.$new() as IRootScopeService & { max: number };
    scope.max = 10;
    const element = $compile(`<ngb-rating rate="3" max="max"></ngb-rating>`)(scope);
    scope.$digest();
    expect(element[0].querySelectorAll(":scope > span")).toHaveLength(10);

    scope.max = 4;
    scope.$digest();
    expect(element[0].querySelectorAll(":scope > span")).toHaveLength(4);
    expect(element.attr("aria-valuemax")).toBe("4");
  });

  it("clamps clicked and programmatic rates to zero through max", () => {
    const element = $compile(`<ngb-rating rate="3" max="5"></ngb-rating>`)($rootScope.$new());
    $rootScope.$digest();
    const rating = element.controller<NgbRating>("ngbRating");

    rating.update(-10);
    expect(rating.rate).toBe(0);
    rating.update(10);
    expect(rating.rate).toBe(5);
  });

  it("supports resettable ratings", () => {
    const scope = $rootScope.$new() as IRootScopeService & { onRateChange: (value: number) => void };
    scope.onRateChange = vi.fn();
    const element = $compile(
      `<ngb-rating rate="2" max="5" resettable="true" rate-change="onRateChange($event)"></ngb-rating>`,
    )(scope);
    scope.$digest();
    const secondStar = element[0].querySelectorAll(":scope > span")[1].querySelector("span:last-child") as HTMLElement;
    angular.element(secondStar).triggerHandler("click");
    scope.$digest();
    expect(element.attr("aria-valuenow")).toBe("0");
    expect(scope.onRateChange).toHaveBeenCalledWith(0);
  });

  it("previews on hover and restores the committed rate on mouseleave", () => {
    const scope = $rootScope.$new() as IRootScopeService & {
      onHover: (value: number) => void;
      onLeave: (value: number) => void;
    };
    scope.onHover = vi.fn();
    scope.onLeave = vi.fn();
    const element = $compile(
      `<ngb-rating rate="2" max="5" hover="onHover($event)" leave="onLeave($event)"></ngb-rating>`,
    )(scope);
    scope.$digest();

    const fourthStar = element[0].querySelectorAll(":scope > span")[3].querySelector("span:last-child") as HTMLElement;
    angular.element(fourthStar).triggerHandler("mouseenter");
    scope.$digest();
    expect(element.attr("aria-valuenow")).toBe("4");
    expect(scope.onHover).toHaveBeenCalledWith(4);

    // `@HostListener("mouseleave")` se registra con `addEventListener` nativo:
    // `triggerHandler` de jqLite no lo alcanza, hay que despachar un evento real.
    element[0].dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    scope.$digest();
    expect(scope.onLeave).toHaveBeenCalledWith(4);
    expect(element.attr("aria-valuenow")).toBe("2");
  });

  it("uses default cursors and aria-readonly when readonly", () => {
    const element = $compile(`<ngb-rating rate="2" max="3" readonly="true"></ngb-rating>`)($rootScope.$new());
    $rootScope.$digest();
    const interactiveStars = element[0].querySelectorAll<HTMLElement>(":scope > span > span:last-child");
    expect(Array.from(interactiveStars, (star) => star.style.cursor)).toEqual(["default", "default", "default"]);
    expect(element.attr("aria-readonly")).toBe("true");
    expect(element.attr("aria-disabled")).toBeUndefined();
  });

  it("supports custom tabindex and removes disabled controls from tab order", () => {
    const scope = $rootScope.$new() as IRootScopeService & { disabled: boolean };
    scope.disabled = false;
    const element = $compile(`<ngb-rating rate="2" tabindex="7" disabled="disabled"></ngb-rating>`)(scope);
    scope.$digest();
    expect(element.attr("tabindex")).toBe("7");
    scope.disabled = true;
    scope.$digest();
    expect(element.attr("tabindex")).toBe("-1");
  });

  it.each([
    ["ArrowLeft", 2],
    ["ArrowDown", 2],
    ["ArrowRight", 4],
    ["ArrowUp", 4],
    ["Home", 0],
    ["End", 5],
  ])("handles %s keyboard navigation", (key, expectedRate) => {
    const element = $compile(`<ngb-rating rate="3" max="5"></ngb-rating>`)($rootScope.$new());
    $rootScope.$digest();
    const event = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key });
    element[0].dispatchEvent(event);
    $rootScope.$digest();
    expect(element.attr("aria-valuenow")).toBe(String(expectedRate));
    expect(event.defaultPrevented).toBe(true);
  });

  it("exposes screen-reader state and a customizable aria value text", () => {
    const scope = $rootScope.$new() as IRootScopeService & { valueText: (current: number, max: number) => string };
    scope.valueText = (current, max) => `${current} of ${max} points`;
    const element = $compile(`<ngb-rating rate="2" max="3" aria-value-text="valueText"></ngb-rating>`)(scope);
    scope.$digest();
    expect(element.attr("aria-valuetext")).toBe("2 of 3 points");
    expect(element[0].querySelectorAll(".visually-hidden")).toHaveLength(3);
  });
});
