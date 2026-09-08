import angular from "angular";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { configureTestBed, type NgbTestBed } from "../../test/testbed";
import { NgbModule } from "../ngb.module";
import type { NgbCarousel } from "./ngb-carousel.component";

describe("ngbCarousel", () => {
  let tb: NgbTestBed;
  let $compile: NgbTestBed["$compile"];
  let $rootScope: NgbTestBed["$rootScope"];

  beforeEach(async () => {
    tb = await configureTestBed(NgbModule);
    $compile = tb.$compile;
    $rootScope = tb.$rootScope;
  });

  afterEach(() => {
    tb.destroy();
    document.body.innerHTML = "";
  });

  const tick = async (scope: angular.IRootScopeService) => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    tb.detectChanges();
    scope.$digest();
  };

  it("renders with active slide from activeId and indicators", async () => {
    const scope = $rootScope.$new();
    const element = $compile(`
            <ngb-carousel
                animation="false"
                interval="0"
                active-id="slide-2"
                show-navigation-arrows="true"
                show-navigation-indicators="true">
                <ng-template ngb-slide id="slide-1">Slide 1</ng-template>
                <ng-template ngb-slide id="slide-2">Slide 2</ng-template>
                <ng-template ngb-slide id="slide-3">Slide 3</ng-template>
            </ngb-carousel>
        `)(scope);
    angular.element(document.body).append(element);
    scope.$digest();
    await tick(scope);

    const host = element[0] as HTMLElement;
    expect(host.classList.contains("carousel")).toBe(true);
    expect(host.classList.contains("slide")).toBe(true);

    const activeSlide = host.querySelector(".carousel-item.active") as HTMLElement;
    expect(activeSlide).toBeTruthy();
    expect(activeSlide.id).toBe("slide-slide-2");
    expect(activeSlide.textContent).toContain("Slide 2");

    const indicators = host.querySelectorAll(".carousel-indicators button");
    expect(indicators.length).toBe(3);
    expect(indicators[1].classList.contains("active")).toBe(true);
    element.remove();
  });

  it("moves to next slide when next control is clicked", async () => {
    const scope = $rootScope.$new();
    const element = $compile(`
            <ngb-carousel
                animation="false"
                interval="0"
                active-id="slide-1"
                show-navigation-arrows="true"
                show-navigation-indicators="true">
                <ng-template ngb-slide id="slide-1">Slide 1</ng-template>
                <ng-template ngb-slide id="slide-2">Slide 2</ng-template>
                <ng-template ngb-slide id="slide-3">Slide 3</ng-template>
            </ngb-carousel>
        `)(scope);
    angular.element(document.body).append(element);
    scope.$digest();

    const host = element[0] as HTMLElement;
    const ctrl = element.controller("ngbCarousel") as {
      next: (source: "arrowRight") => void;
    };
    ctrl.next("arrowRight");
    scope.$digest();
    await tick(scope);
    await tick(scope);

    const activeSlide = host.querySelector(".carousel-item.active") as HTMLElement;
    expect(activeSlide.id).toBe("slide-slide-2");
    element.remove();
  });

  it("moves to selected slide when indicator is clicked", async () => {
    const scope = $rootScope.$new();
    const element = $compile(`
            <ngb-carousel
                animation="false"
                interval="0"
                active-id="slide-1"
                show-navigation-arrows="true"
                show-navigation-indicators="true">
                <ng-template ngb-slide id="slide-1">Slide 1</ng-template>
                <ng-template ngb-slide id="slide-2">Slide 2</ng-template>
                <ng-template ngb-slide id="slide-3">Slide 3</ng-template>
            </ngb-carousel>
        `)(scope);
    angular.element(document.body).append(element);
    scope.$digest();

    const host = element[0] as HTMLElement;
    const indicators = host.querySelectorAll(".carousel-indicators button");
    (indicators[2] as HTMLButtonElement).click();
    scope.$digest();
    await tick(scope);
    await tick(scope);

    const activeSlide = host.querySelector(".carousel-item.active") as HTMLElement;
    expect(activeSlide.id).toBe("slide-slide-3");
    expect(indicators[2].classList.contains("active")).toBe(true);
    element.remove();
  });

  it("updates projected slides when the content collection changes", () => {
    const scope = $rootScope.$new() as IRootScopeService & { showSecond: boolean };
    scope.showSecond = false;

    const element = $compile(`
      <ngb-carousel animation="false" interval="0">
        <ng-template ngb-slide id="slide-1">Slide 1</ng-template>
        <div ng-if="showSecond">
          <ng-template ngb-slide id="slide-2">Slide 2</ng-template>
        </div>
      </ngb-carousel>
    `)(scope);
    scope.$digest();

    expect(element[0].querySelectorAll(".carousel-item")).toHaveLength(1);

    scope.showSecond = true;
    scope.$digest();

    expect(element[0].querySelectorAll(".carousel-item")).toHaveLength(2);
  });

  it("does not collect slides from a nested carousel", () => {
    const element = $compile(`
      <ngb-carousel animation="false" interval="0">
        <ng-template ngb-slide id="outer-slide">
          <ngb-carousel animation="false" interval="0">
            <ng-template ngb-slide id="inner-slide">Inner slide</ng-template>
          </ngb-carousel>
        </ng-template>
      </ngb-carousel>
    `)($rootScope.$new());
    $rootScope.$digest();

    const carousel = element.controller<NgbCarousel>("ngbCarousel");
    expect(carousel.slides.map(({ id }) => id)).toEqual(["outer-slide"]);
  });

  it("processes directives in slide templates using their declaration context", () => {
    const imageUrl = "https://example.test/projected-image.jpg";
    const scope = $rootScope.$new() as IRootScopeService & { $: { images: string[] } };
    scope.$ = { images: [imageUrl] };

    const element = $compile(`
      <ngb-carousel animation="false" interval="0">
        <ng-template ngb-slide id="slide-1">
          <img ng-src="{{ $.images[0] }}" alt="Projected image" />
        </ng-template>
      </ngb-carousel>
    `)(scope);
    scope.$digest();

    const image = element[0].querySelector<HTMLImageElement>(".carousel-item img");
    expect(image?.getAttribute("src")).toBe(imageUrl);
  });
});
