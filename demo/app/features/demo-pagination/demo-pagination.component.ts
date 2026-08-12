import template from "@demo/features/demo-pagination/demo-pagination.component.html";
import type { IComponentOptions } from "angular";

export class DemoPaginationComponent {
  readonly items = Array.from({ length: 42 }, (_, index) => ({
    id: index + 1,
    name: `Record ${index + 1}`,
    category: ["Design", "Development", "Testing"][index % 3],
  }));

  basicPage = 1;
  basicPageSize = 5;
  boundaryPage = 4;
  rotatedPage = 12;
  smallPage = 2;
  largePage = 2;
  pageSize = 10;

  setBasicPage(page: number): void {
    this.basicPage = page;
  }

  getBasicPageItems() {
    const start = (this.basicPage - 1) * this.basicPageSize;
    return this.items.slice(start, start + this.basicPageSize);
  }

  setBoundaryPage(page: number): void {
    this.boundaryPage = page;
  }

  setRotatedPage(page: number): void {
    this.rotatedPage = page;
  }

  setSmallPage(page: number): void {
    this.smallPage = page;
  }

  setLargePage(page: number): void {
    this.largePage = page;
  }

  static get $name() {
    return "ngbDemoPagination";
  }

  static get $factory(): IComponentOptions {
    return {
      controller: DemoPaginationComponent,
      controllerAs: "$",
      template,
    };
  }
}
