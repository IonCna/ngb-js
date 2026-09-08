import type { IAugmentedJQuery, ICompileService, IRootScopeService } from "angular";
import angular from "angular";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NgbModule } from "../ngb.module";
import type { NgbPagination } from "./ngb-pagination.component";
import { NgbPaginationConfig } from "./ngb-pagination-config.service";

type PaginationScope = IRootScopeService & {
  boundaryLinks: boolean;
  collectionSize: number;
  disabled: boolean;
  ellipses: boolean;
  maxSize: number;
  onPageChange: (page: number) => void;
  page: number;
  pageSize: number;
  rotate: boolean;
  size?: string;
};

describe("ngbPagination", () => {
  let $compile: ICompileService;
  let $rootScope: IRootScopeService;

  beforeEach(() => {
    angular.mock.module(NgbModule.name);
    angular.mock.inject((_$compile_: ICompileService, _$rootScope_: IRootScopeService) => {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    });
  });

  function createPagination(template = "", values: Partial<PaginationScope> = {}) {
    const scope = $rootScope.$new() as PaginationScope;
    Object.assign(scope, {
      boundaryLinks: false,
      collectionSize: 100,
      disabled: false,
      ellipses: true,
      maxSize: 0,
      onPageChange: vi.fn(),
      page: 1,
      pageSize: 10,
      rotate: false,
      ...values,
    });
    const markup =
      template ||
      `<ngb-pagination
        collection-size="collectionSize"
        page="page"
        page-size="pageSize"
        max-size="maxSize"
        rotate="rotate"
        ellipses="ellipses"
        boundary-links="boundaryLinks"
        disabled="disabled"
        size="size"
        page-change="onPageChange($event)">
      </ngb-pagination>`;
    const element = $compile(markup)(scope);
    scope.$digest();
    return {
      controller: element.controller("ngbPagination") as NgbPagination,
      element,
      links: () => Array.from(element[0].querySelectorAll<HTMLAnchorElement>("a.page-link")),
      items: () => Array.from(element[0].querySelectorAll<HTMLLIElement>("li.page-item")),
      scope,
    };
  }

  function itemTexts(element: IAugmentedJQuery) {
    return Array.from(element[0].querySelectorAll("li.page-item"), (item) => item.textContent?.trim());
  }

  it("uses the same sensible defaults as NgbPaginationConfig", () => {
    const { controller } = createPagination(`<ngb-pagination collection-size="100"></ngb-pagination>`);
    const defaults = new NgbPaginationConfig();

    expect(controller.disabled).toBe(defaults.disabled);
    expect(controller.boundaryLinks).toBe(defaults.boundaryLinks);
    expect(controller.directionLinks).toBe(defaults.directionLinks);
    expect(controller.ellipses).toBe(defaults.ellipses);
    expect(controller.maxSize).toBe(defaults.maxSize);
    expect(controller.pageSize).toBe(defaults.pageSize);
    expect(controller.rotate).toBe(defaults.rotate);
    expect(controller.size).toBe(defaults.size);
  });

  it("calculates pages and reacts to collectionSize and pageSize changes", () => {
    const tester = createPagination();
    expect(tester.controller.pageCount).toBe(10);
    expect(tester.controller.pages).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    tester.scope.collectionSize = 200;
    tester.scope.pageSize = 20;
    tester.scope.$digest();

    expect(tester.controller.pageCount).toBe(10);
    expect(tester.items()).toHaveLength(12);
  });

  it("clamps the selected page to the valid range", () => {
    const tester = createPagination("", { collectionSize: 100, page: 100 });
    expect(tester.controller.page).toBe(10);

    tester.scope.page = -100;
    tester.scope.$digest();
    expect(tester.controller.page).toBe(1);

    tester.scope.page = 5;
    tester.scope.collectionSize = 10;
    tester.scope.$digest();
    expect(tester.controller.page).toBe(1);
  });

  it("renders direction links, active state and accessibility attributes", () => {
    const tester = createPagination("", { collectionSize: 30, page: 1 });
    expect(itemTexts(tester.element)).toEqual(["\u00ab", "1", "2", "3", "\u00bb"]);
    expect(tester.items()[0].classList.contains("disabled")).toBe(true);
    expect(tester.links()[0].getAttribute("tabindex")).toBe("-1");
    expect(tester.links()[0].getAttribute("aria-disabled")).toBe("true");
    expect(tester.links()[1].getAttribute("aria-current")).toBe("page");
    expect(tester.element.attr("role")).toBe("navigation");
  });

  it("selects pages through number, direction and boundary links", () => {
    const tester = createPagination("", { boundaryLinks: true, collectionSize: 30, page: 2 });

    angular.element(tester.links()[4]).triggerHandler("click");
    tester.scope.$digest();
    expect(tester.controller.page).toBe(3);
    expect(tester.scope.onPageChange).toHaveBeenLastCalledWith(3);

    angular.element(tester.links()[0]).triggerHandler("click");
    tester.scope.$digest();
    expect(tester.controller.page).toBe(1);

    const links = tester.links();
    angular.element(links[links.length - 1]).triggerHandler("click");
    tester.scope.$digest();
    expect(tester.controller.page).toBe(3);
  });

  it("paginates page-number windows when rotation is disabled", () => {
    const tester = createPagination("", { collectionSize: 70, ellipses: false, maxSize: 3, page: 1 });
    expect(tester.controller.pages).toEqual([1, 2, 3]);

    tester.scope.page = 4;
    tester.scope.$digest();
    expect(tester.controller.pages).toEqual([4, 5, 6]);

    tester.scope.page = 7;
    tester.scope.$digest();
    expect(tester.controller.pages).toEqual([7]);
  });

  it("rotates page-number windows around the active page", () => {
    const tester = createPagination("", { collectionSize: 70, ellipses: false, maxSize: 3, page: 1, rotate: true });
    expect(tester.controller.pages).toEqual([1, 2, 3]);

    tester.scope.page = 4;
    tester.scope.$digest();
    expect(tester.controller.pages).toEqual([3, 4, 5]);

    tester.scope.page = 7;
    tester.scope.$digest();
    expect(tester.controller.pages).toEqual([5, 6, 7]);
  });

  it("adds ellipses and exposes them as disabled links", () => {
    const tester = createPagination("", { collectionSize: 120, maxSize: 5, page: 6, rotate: true });
    expect(tester.controller.pages).toEqual([1, -1, 4, 5, 6, 7, 8, -1, 12]);

    const ellipses = tester.items().filter((item) => item.textContent?.trim() === "...");
    expect(ellipses).toHaveLength(2);
    for (const item of ellipses) {
      expect(item.classList.contains("disabled")).toBe(true);
      expect(item.querySelector("a")?.getAttribute("tabindex")).toBe("-1");
      expect(item.querySelector("a")?.getAttribute("aria-disabled")).toBe("true");
    }
  });

  it("shows the single hidden page instead of an ellipsis", () => {
    const tester = createPagination("", { collectionSize: 120, maxSize: 5, page: 8, rotate: true });
    expect(tester.controller.pages).toEqual([1, -1, 6, 7, 8, 9, 10, 11, 12]);
  });

  it("handles edge values without rendering numbered pages", () => {
    const tester = createPagination("", { collectionSize: 0 });
    expect(tester.controller.pageCount).toBe(0);
    expect(tester.controller.pages).toEqual([]);

    tester.scope.collectionSize = Number.NaN;
    tester.scope.$digest();
    expect(tester.controller.pages).toEqual([]);

    tester.scope.collectionSize = 50;
    tester.scope.pageSize = 0;
    tester.scope.$digest();
    expect(tester.controller.pages).toEqual([]);
  });

  it("disables every link and prevents page changes when disabled", () => {
    const tester = createPagination("", { collectionSize: 30, disabled: true, page: 2 });
    for (const item of tester.items()) expect(item.classList.contains("disabled")).toBe(true);
    for (const link of tester.links()) {
      expect(link.getAttribute("tabindex")).toBe("-1");
      expect(link.getAttribute("aria-disabled")).toBe("true");
    }

    angular.element(tester.links()[1]).triggerHandler("click");
    tester.scope.$digest();
    expect(tester.controller.page).toBe(2);
  });

  it("applies the configured Bootstrap size class", () => {
    const tester = createPagination("", { size: "sm" });
    expect(tester.element[0].querySelector("ul")?.classList.contains("pagination-sm")).toBe(true);
  });

  it("allows every pagination link template to be customized", () => {
    const tester = createPagination(`
      <ngb-pagination collection-size="50" page="1" boundary-links="true" max-size="2">
        <ng-template ngb-pagination-first>F</ng-template>
        <ng-template ngb-pagination-last>L</ng-template>
        <ng-template ngb-pagination-previous>P</ng-template>
        <ng-template ngb-pagination-next>N</ng-template>
        <ng-template ngb-pagination-ellipsis>E</ng-template>
        <ng-template ngb-pagination-number let-page let-current-page="currentPage">{{ page }}:{{ currentPage }}</ng-template>
      </ngb-pagination>
    `);

    expect(itemTexts(tester.element)).toEqual(["F", "P", "1:1", "2:1", "E", "5:1", "N", "L"]);
  });

  it("renders a custom pages template with page, pages and disabled context", () => {
    const tester = createPagination(`
      <ngb-pagination collection-size="30" page="2" disabled="true">
        <ng-template ngb-pagination-pages let-page let-pages="pages" let-disabled="disabled">
          <li class="custom-pages">{{ page }} / {{ pages.length }} / {{ disabled }}</li>
        </ng-template>
      </ngb-pagination>
    `);

    expect(tester.element[0].querySelector(".custom-pages")?.textContent?.replace(/\s+/g, " ").trim()).toBe(
      "2 / 3 / true",
    );
    expect(tester.element[0].querySelectorAll("li.page-item")).toHaveLength(2);
  });
});

describe("NgbPaginationConfig", () => {
  it("has the upstream default values", () => {
    const config = new NgbPaginationConfig();
    expect(config).toMatchObject({
      boundaryLinks: false,
      directionLinks: true,
      disabled: false,
      ellipses: true,
      maxSize: 0,
      pageSize: 10,
      rotate: false,
    });
    expect(config.size).toBeUndefined();
  });
});
