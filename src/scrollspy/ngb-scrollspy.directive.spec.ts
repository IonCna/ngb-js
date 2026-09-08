import type { ICompileService, IRootScopeService } from "angular";
import angular from "angular";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configureTestBed, type NgbTestBed } from "../../test/testbed";
import { NgbModule } from "../ngb.module";
import type { NgbScrollSpy } from "./ngb-scrollspy.directive";

class IntersectionObserverMock {
  static instances: IntersectionObserverMock[] = [];
  readonly disconnect = vi.fn();
  readonly observe = vi.fn();

  constructor(
    readonly callback: IntersectionObserverCallback,
    readonly options?: IntersectionObserverInit,
  ) {
    IntersectionObserverMock.instances.push(this);
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  unobserve(): void {}
}

describe("ngbScrollSpy directives", () => {
  let tb: NgbTestBed;
  let $compile: ICompileService;
  let $rootScope: IRootScopeService;
  let originalObserver: typeof IntersectionObserver | undefined;

  beforeEach(async () => {
    originalObserver = globalThis.IntersectionObserver;
    IntersectionObserverMock.instances = [];
    globalThis.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver;
    tb = await configureTestBed(NgbModule);
    $compile = tb.$compile;
    $rootScope = tb.$rootScope;
  });

  afterEach(() => {
    tb.destroy();
    globalThis.IntersectionObserver = originalObserver as typeof IntersectionObserver;
    document.body.innerHTML = "";
  });

  function create() {
    const scope = $rootScope.$new() as IRootScopeService & {
      active?: string;
      processChanges?: () => void;
      spy?: NgbScrollSpy;
    };
    const element = $compile(`
      <div>
        <div class="spy-container" ngb-scroll-spy ng-ref="spy" ng-ref-read="ngbScrollSpy"
          active-change="active = $event" root-margin="10px" threshold="0.5">
          <section ngb-scroll-spy-fragment="'one'">One</section>
          <section ngb-scroll-spy-fragment="'two'">Two</section>
        </div>
        <button class="one-link" ngb-scroll-spy-item="[spy, 'one']">One link</button>
        <button class="two-link" ngb-scroll-spy-item="[spy, 'two']">Two link</button>
      </div>
    `)(scope);
    angular.element(document.body).append(element);
    tb.detectChanges();
    return { element, scope, spy: scope.spy as NgbScrollSpy };
  }

  it("starts with host semantics and observes registered fragments", () => {
    const { element, spy } = create();
    const container = element[0].querySelector(".spy-container") as HTMLElement;
    const observer = IntersectionObserverMock.instances[0];
    expect(spy).toBeDefined();
    expect(container.getAttribute("tabindex")).toBe("0");
    expect(container.style.overflowY).toBe("auto");
    expect(observer.options).toMatchObject({ root: container, rootMargin: "10px", threshold: 0.5 });
    expect(observer.observe).toHaveBeenCalledTimes(2);
  });

  it("updates active output and item classes from intersections", () => {
    const { element, scope, spy } = create();
    const fragments = element[0].querySelectorAll("section");
    const observer = IntersectionObserverMock.instances[0];
    observer.callback(
      [{ isIntersecting: true, target: fragments[1] } as IntersectionObserverEntry],
      observer as unknown as IntersectionObserver,
    );
    tb.detectChanges();
    expect(spy.active).toBe("two");
    expect(scope.active).toBe("two");
    expect(element[0].querySelector(".two-link")?.classList.contains("active")).toBe(true);
    expect(element[0].querySelector(".one-link")?.classList.contains("active")).toBe(false);
  });

  it("scrolls to the associated fragment when an item is clicked", () => {
    const { element } = create();
    const container = element[0].querySelector(".spy-container") as HTMLElement;
    const scrollTo = vi.fn();
    container.scrollTo = scrollTo;
    Object.defineProperty(container, "offsetTop", { configurable: true, value: 10 });
    Object.defineProperty(container.querySelector("#two"), "offsetTop", { configurable: true, value: 210 });
    (element[0].querySelector(".two-link") as HTMLElement).click();
    expect(scrollTo).toHaveBeenCalledWith({ behavior: "smooth", top: 200 });
  });

  it("passes custom processChanges and supports imperative active changes", () => {
    const scope = $rootScope.$new() as IRootScopeService & {
      active?: string;
      custom: ReturnType<typeof vi.fn>;
      spy?: NgbScrollSpy;
    };
    scope.custom = vi.fn((_state, changeActive: (active: string) => void) => changeActive("custom"));
    const element = $compile(`
      <div ngb-scroll-spy ng-ref="spy" ng-ref-read="ngbScrollSpy" process-changes="custom"
        active-change="active = $event"><section ngb-scroll-spy-fragment="'one'">One</section></div>
    `)(scope);
    tb.detectChanges();
    const observer = IntersectionObserverMock.instances[0];
    observer.callback([], observer as unknown as IntersectionObserver);
    tb.detectChanges();
    expect(scope.custom).toHaveBeenCalledOnce();
    expect(scope.active).toBe("custom");
    expect(scope.spy?.active).toBe("custom");
    element.remove();
  });

  it("unobserves fragments when their views are destroyed", () => {
    const scope = $rootScope.$new() as IRootScopeService & { visible: boolean };
    scope.visible = true;
    const element = $compile(`
      <div ngb-scroll-spy><section ng-if="visible" ngb-scroll-spy-fragment="'one'">One</section></div>
    `)(scope);
    tb.detectChanges();
    const observer = IntersectionObserverMock.instances[0];
    scope.visible = false;
    tb.detectChanges();
    expect(observer.disconnect).toHaveBeenCalled();
    expect(observer.observe).toHaveBeenCalledTimes(1);
    element.remove();
  });
});
