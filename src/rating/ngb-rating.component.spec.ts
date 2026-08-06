import type { ICompileService, IRootScopeService } from "angular";
import angular from "angular";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NgbModule } from "../ngb.module";

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
    const scope = $rootScope.$new();

    const element = $compile(`<ngb-rating rate="2" max="5" disabled="true"></ngb-rating>`)(scope);
    scope.$digest();

    const fourthStar = element[0].querySelectorAll(":scope > span")[3].querySelector("span:last-child") as HTMLElement;
    angular.element(fourthStar).triggerHandler("click");
    scope.$digest();

    expect(element.attr("aria-valuenow")).toBe("2");
    expect(element.attr("aria-disabled")).toBe("true");
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
});
