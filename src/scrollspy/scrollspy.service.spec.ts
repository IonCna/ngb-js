import { Injector } from "ngjs-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configureTestBed, type NgbTestBed } from "../../test/testbed";
import { NgbModule } from "../ngb.module";
import { NgbScrollSpyService } from "./scrollspy.service";

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

describe("NgbScrollSpyService", () => {
  let tb: NgbTestBed;
  let service: NgbScrollSpyService;
  let originalObserver: typeof IntersectionObserver | undefined;

  beforeEach(async () => {
    originalObserver = globalThis.IntersectionObserver;
    IntersectionObserverMock.instances = [];
    globalThis.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver;
    tb = await configureTestBed(NgbModule);
    service = tb.get<Injector>(Injector.$name).get(NgbScrollSpyService);
  });

  afterEach(() => {
    service.ngOnDestroy();
    tb.destroy();
    globalThis.IntersectionObserver = originalObserver as typeof IntersectionObserver;
  });

  function createRoot() {
    const root = document.createElement("div");
    root.innerHTML = `<section id="one"></section><section id="two"></section>`;
    document.body.appendChild(root);
    return root;
  }

  it("observes pre-registered and start-option fragments", () => {
    const root = createRoot();
    service.observe("one");
    service.start({ fragments: ["two"], root, rootMargin: "10px", threshold: 0.5 });

    const observer = IntersectionObserverMock.instances[0];
    expect(observer.options).toMatchObject({ root, rootMargin: "10px", threshold: 0.5 });
    expect(observer.observe).toHaveBeenCalledWith(root.children[0]);
    expect(observer.observe).toHaveBeenCalledWith(root.children[1]);
    root.remove();
  });

  it("does not observe a fragment twice and rebuilds observation after unobserve", () => {
    const root = createRoot();
    service.start({ root });
    const observer = IntersectionObserverMock.instances[0];
    service.observe("one");
    service.observe("one");
    expect(observer.observe).toHaveBeenCalledTimes(1);

    service.observe("two");
    service.unobserve("one");
    expect(observer.disconnect).toHaveBeenCalledOnce();
    expect(observer.observe).toHaveBeenLastCalledWith(root.children[1]);
    root.remove();
  });

  it("publishes distinct active fragment changes from processChanges", () => {
    const root = createRoot();
    const active = vi.fn();
    service.active$.subscribe(active);
    service.start({
      root,
      processChanges: (_state, changeActive) => {
        changeActive("one");
        changeActive("one");
        changeActive("two");
      },
    });

    IntersectionObserverMock.instances[0].callback([], IntersectionObserverMock.instances[0] as never);
    expect(active.mock.calls).toEqual([["one"], ["two"]]);
    expect(service.active).toBe("two");
    root.remove();
  });

  it("disconnects and clears active state on stop", () => {
    const root = createRoot();
    const active = vi.fn();
    service.active$.subscribe(active);
    service.start({ root, processChanges: (_state, changeActive) => changeActive("one") });
    const observer = IntersectionObserverMock.instances[0];
    observer.callback([], observer as never);
    service.stop();

    expect(observer.disconnect).toHaveBeenCalledOnce();
    expect(service.active).toBe("");
    expect(active).toHaveBeenLastCalledWith("");
    root.remove();
  });

  it("ignores missing fragments and supports unregistering before start", () => {
    const root = createRoot();
    service.observe("one");
    service.unobserve("one");
    service.start({ root });
    const observer = IntersectionObserverMock.instances[0];
    expect(observer.observe).not.toHaveBeenCalled();
    service.observe("missing");
    service.unobserve("missing");
    expect(observer.observe).not.toHaveBeenCalled();
    root.remove();
  });

  it("disconnects the previous observer when restarted", () => {
    const root = createRoot();
    service.start({ root });
    const first = IntersectionObserverMock.instances[0];
    service.start({ root, threshold: [0, 1] });
    expect(first.disconnect).toHaveBeenCalledOnce();
    expect(IntersectionObserverMock.instances).toHaveLength(2);
    expect(IntersectionObserverMock.instances[1].options?.threshold).toEqual([0, 1]);
    root.remove();
  });

  it("scrolls to existing fragments using configured and explicit behavior", () => {
    const root = createRoot();
    const scrollTo = vi.fn();
    root.scrollTo = scrollTo;
    Object.defineProperty(root, "offsetTop", { configurable: true, value: 20 });
    Object.defineProperty(root.children[1], "offsetTop", { configurable: true, value: 220 });
    const animationFrame = vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });
    service.start({ root, scrollBehavior: "smooth" });
    service.scrollTo("two");
    expect(scrollTo).toHaveBeenLastCalledWith({ behavior: "smooth", top: 200 });
    service.scrollTo(root.children[0] as HTMLElement, { behavior: "auto" });
    expect(scrollTo).toHaveBeenLastCalledWith({ behavior: "auto", top: -20 });
    animationFrame.mockRestore();
    root.remove();
  });

  it("does not scroll when stopped or when a fragment is missing", () => {
    const root = createRoot();
    const scrollTo = vi.fn();
    root.scrollTo = scrollTo;
    service.scrollTo("one");
    service.start({ root });
    service.scrollTo("missing");
    expect(scrollTo).not.toHaveBeenCalled();
    root.remove();
  });

  it("marks the supplied change detector when active changes", () => {
    const root = createRoot();
    const markForCheck = vi.fn();
    service.start({
      changeDetectorRef: { markForCheck } as never,
      processChanges: (_state, changeActive) => changeActive("one"),
      root,
    });
    const observer = IntersectionObserverMock.instances[0];
    observer.callback([], observer as never);
    expect(markForCheck).toHaveBeenCalledOnce();
    root.remove();
  });
});
