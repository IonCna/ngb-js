import type { ICompileService, IRootScopeService } from "angular";
import angular from "angular";
import { getNgModuleName } from "ngjs-core";
import { beforeEach, describe, expect, it } from "vitest";
import { NgbModule } from "../ngb.module";

describe("ngbProgressbar", () => {
  let $compile: ICompileService;
  let $rootScope: IRootScopeService;

  beforeEach(() => {
    angular.mock.module(getNgModuleName(NgbModule));
    angular.mock.inject((_$compile_: ICompileService, _$rootScope_: IRootScopeService) => {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    });
  });

  it("renders host aria attributes and width from value/max", () => {
    const scope = $rootScope.$new() as IRootScopeService & {
      value: number;
      max: number;
    };
    scope.value = 25;
    scope.max = 100;

    const element = $compile(`
            <ngb-progressbar
                value="value"
                max="max"
                aria-label="'Download'"
                show-value="true"
                striped="true"
                animated="true"
                type="'success'"
                text-type="'dark'">
            </ngb-progressbar>
        `)(scope);
    scope.$digest();

    const host = element[0] as HTMLElement;
    const progress = host;
    const progressBar = host.querySelector(".progress-bar") as HTMLElement;

    expect(progress).toBeTruthy();
    expect(progress.classList.contains("progress")).toBe(true);
    expect(progress.getAttribute("role")).toBe("progressbar");
    expect(progress.getAttribute("aria-valuenow")).toBe("25");
    expect(progress.getAttribute("aria-valuemax")).toBe("100");
    expect(progress.getAttribute("aria-label")).toBe("Download");
    expect(progressBar.style.width).toBe("25%");
    expect(progressBar.classList.contains("progress-bar-striped")).toBe(true);
    expect(progressBar.classList.contains("progress-bar-animated")).toBe(true);
    expect(progressBar.textContent?.trim()).toBe("25%");
  });

  it("sets host width when inside ngb-progressbar-stacked", () => {
    const scope = $rootScope.$new() as IRootScopeService & { value: number };
    scope.value = 20;

    const element = $compile(`
            <ngb-progressbar-stacked>
                <ngb-progressbar value="value"></ngb-progressbar>
            </ngb-progressbar-stacked>
        `)(scope);
    scope.$digest();

    const host = element[0] as HTMLElement;
    const stacked = host;
    const progress = host.querySelector("ngb-progressbar") as HTMLElement;
    const progressBar = host.querySelector(".progress-bar") as HTMLElement;

    expect(stacked).toBeTruthy();
    expect(stacked.classList.contains("progress-stacked")).toBe(true);
    expect(progress.style.width).toBe("20%");
    expect(progress.classList.contains("progress")).toBe(true);
    expect(progress.getAttribute("role")).toBe("progressbar");
    expect(progress.getAttribute("aria-valuenow")).toBe("20");
    expect(progressBar.style.width).toBe("");
  });

  it.each([
    [null, 100],
    [undefined, 100],
    [0, 100],
    [-10, 100],
    [Number.POSITIVE_INFINITY, 100],
    [Number.NEGATIVE_INFINITY, 100],
    [200, 200],
  ])("normalizes max %s to %s", (max, expected) => {
    const scope = $rootScope.$new() as IRootScopeService & { max: number | null | undefined };
    scope.max = max;
    const element = $compile(`<ngb-progressbar value="50" max="max"></ngb-progressbar>`)(scope);
    scope.$digest();
    expect(element.attr("aria-valuemax")).toBe(String(expected));
  });

  it.each([
    [-1, "0", "0%"],
    [0, "0", "0%"],
    [25, "25", "25%"],
    [100, "100", "100%"],
    [150, "100", "100%"],
  ])("clamps value %s to the valid range", (value, ariaValue, width) => {
    const element = $compile(`<ngb-progressbar value="${value}" max="100"></ngb-progressbar>`)($rootScope.$new());
    $rootScope.$digest();
    expect(element.attr("aria-valuenow")).toBe(ariaValue);
    expect((element[0].querySelector(".progress-bar") as HTMLElement).style.width).toBe(width);
  });

  it("reacts to value and max changes", () => {
    const scope = $rootScope.$new() as IRootScopeService & { max: number; value: number };
    scope.max = 200;
    scope.value = 100;
    const element = $compile(`<ngb-progressbar value="value" max="max"></ngb-progressbar>`)(scope);
    scope.$digest();
    const bar = element[0].querySelector(".progress-bar") as HTMLElement;
    expect(bar.style.width).toBe("50%");

    scope.value = 150;
    scope.max = 100;
    scope.$digest();
    expect(element.attr("aria-valuenow")).toBe("100");
    expect(bar.style.width).toBe("100%");
  });

  it("applies type and text type classes without a false class", () => {
    const scope = $rootScope.$new() as IRootScopeService & { textType?: string; type?: string };
    scope.type = "success";
    const element = $compile(`<ngb-progressbar value="25" type="type" text-type="textType"></ngb-progressbar>`)(scope);
    scope.$digest();
    const bar = element[0].querySelector(".progress-bar") as HTMLElement;
    expect(bar.classList.contains("text-bg-success")).toBe(true);
    expect(bar.classList.contains("false")).toBe(false);

    scope.textType = "dark";
    scope.$digest();
    expect(bar.classList.contains("bg-success")).toBe(true);
    expect(bar.classList.contains("text-dark")).toBe(true);
  });

  it("renders projected labels and optional percentage values", () => {
    const element = $compile(
      `<ngb-progressbar value="25" max="50" show-value="true"><strong>Complete</strong></ngb-progressbar>`,
    )($rootScope.$new());
    $rootScope.$digest();
    const bar = element[0].querySelector(".progress-bar") as HTMLElement;
    expect(bar.textContent).toContain("50%");
    expect(bar.textContent).toContain("Complete");
  });

  it("accepts height and an accessible name", () => {
    const element = $compile(`<ngb-progressbar value="20" height="'2rem'" aria-label="'Upload'"></ngb-progressbar>`)(
      $rootScope.$new(),
    );
    $rootScope.$digest();
    expect((element[0] as HTMLElement).style.height).toBe("2rem");
    expect(element.attr("aria-label")).toBe("Upload");
    expect(element.attr("aria-valuemin")).toBe("0");
  });
});
