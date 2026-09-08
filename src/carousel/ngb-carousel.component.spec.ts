import angular from "angular";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

  function createCarousel(attributes = "") {
    const scope = $rootScope.$new() as angular.IRootScopeService & {
      onSlide: (event: unknown) => void;
      onSlid: (event: unknown) => void;
    };
    scope.onSlide = vi.fn();
    scope.onSlid = vi.fn();
    const element = $compile(`
      <ngb-carousel animation="false" interval="0" ${attributes} slide="onSlide($event)" slid="onSlid($event)">
        <ng-template ngb-slide id="one">One</ng-template>
        <ng-template ngb-slide id="two">Two</ng-template>
        <ng-template ngb-slide id="three">Three</ng-template>
      </ngb-carousel>
    `)(scope);
    angular.element(document.body).append(element);
    tb.detectChanges();
    return { carousel: element.controller<NgbCarousel>("ngbCarousel"), element, scope };
  }

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

  it("selects the first slide by default and tolerates an empty carousel", () => {
    const { carousel, element } = createCarousel();
    expect(carousel.activeId).toBe("one");
    expect(element[0].querySelector(".carousel-item.active")?.id).toBe("slide-one");

    const empty = $compile(`<ngb-carousel animation="false" interval="0"></ngb-carousel>`)($rootScope.$new());
    tb.detectChanges();
    expect(empty.controller<NgbCarousel>("ngbCarousel").activeId).toBe("");
    expect(empty[0].querySelectorAll(".carousel-item")).toHaveLength(0);
  });

  it("corrects an unknown active id to the first slide", () => {
    const { carousel } = createCarousel(`active-id="missing"`);
    expect(carousel.activeId).toBe("one");
  });

  it("navigates with next, previous and select", () => {
    const { carousel } = createCarousel(`active-id="one"`);
    carousel.next();
    expect(carousel.activeId).toBe("two");
    carousel.prev();
    expect(carousel.activeId).toBe("one");
    carousel.select("three");
    expect(carousel.activeId).toBe("three");
    carousel.select("missing");
    expect(carousel.activeId).toBe("three");
  });

  it("wraps by default and stops at boundaries when wrap is false", () => {
    const wrapping = createCarousel(`active-id="three"`);
    wrapping.carousel.next();
    expect(wrapping.carousel.activeId).toBe("one");

    const bounded = createCarousel(`active-id="three" wrap="false"`);
    bounded.carousel.next();
    expect(bounded.carousel.activeId).toBe("three");
    bounded.carousel.select("one");
    bounded.carousel.prev();
    expect(bounded.carousel.activeId).toBe("one");
  });

  it("emits direction, source and pause state for slide transitions", () => {
    const { carousel, scope } = createCarousel(`active-id="one"`);
    carousel.pause();
    carousel.next(carousel.NgbSlideEventSource.ARROW_RIGHT);
    expect(scope.onSlide).toHaveBeenCalledWith(
      expect.objectContaining({ current: "two", direction: "start", paused: true, prev: "one", source: "arrowRight" }),
    );
    expect(scope.onSlid).toHaveBeenCalledWith(expect.objectContaining({ current: "two" }));
    carousel.cycle();
    carousel.prev(carousel.NgbSlideEventSource.ARROW_LEFT);
    expect(scope.onSlide).toHaveBeenLastCalledWith(expect.objectContaining({ direction: "end", paused: false }));
  });

  it("honors arrow-key navigation and the keyboard flag", () => {
    const enabled = createCarousel(`active-id="one" keyboard="true"`);
    enabled.element[0].dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "ArrowRight" }));
    expect(enabled.carousel.activeId).toBe("two");
    expect(document.activeElement).toBe(enabled.element[0]);

    const disabled = createCarousel(`active-id="one" keyboard="false"`);
    disabled.element[0].dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "ArrowRight" }));
    expect(disabled.carousel.activeId).toBe("one");
  });

  it("renders navigation controls according to their flags", () => {
    const hidden = createCarousel(`show-navigation-arrows="false" show-navigation-indicators="false"`);
    expect(hidden.element[0].querySelector(".carousel-control-next")).toBeNull();
    expect(hidden.element[0].querySelector(".carousel-indicators")).toBeNull();

    const visible = createCarousel(`show-navigation-arrows="true" show-navigation-indicators="true"`);
    expect(visible.element[0].querySelectorAll(".carousel-control-prev, .carousel-control-next")).toHaveLength(2);
    expect(visible.element[0].querySelectorAll(".carousel-indicators button")).toHaveLength(3);
  });
});
