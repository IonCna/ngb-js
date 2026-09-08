import { describe, expect, it, vi } from "vitest";
import type { NgbScrollSpyService } from "./scrollspy.service";
import { defaultProcessChanges, toFragmentElement } from "./scrollspy.utils";

describe("scrollspy utilities", () => {
  function fixture() {
    const root = document.createElement("div");
    root.innerHTML = `<section id="one"></section><section id="two"></section><section id="three"></section>`;
    const elements = Array.from(root.children);
    return { elements, fragments: new Set<Element>(elements), root };
  }

  it("resolves fragment ids and accepts elements directly", () => {
    const { elements, root } = fixture();
    expect(toFragmentElement(root, "two")).toBe(elements[1]);
    expect(toFragmentElement(root, elements[2] as HTMLElement)).toBe(elements[2]);
    expect(toFragmentElement(root, "missing")).toBeNull();
    expect(toFragmentElement(null, "one")).toBeNull();
  });

  it("selects the first visible fragment in DOM order", () => {
    const { elements, fragments, root } = fixture();
    const changeActive = vi.fn();
    const context = {};
    const scrollSpy = { active: "" } as NgbScrollSpyService;
    const entries = [
      { isIntersecting: true, target: elements[1] },
      { isIntersecting: true, target: elements[0] },
    ] as IntersectionObserverEntry[];

    defaultProcessChanges({ entries, fragments, options: {}, rootElement: root, scrollSpy }, changeActive, context);
    expect(changeActive).toHaveBeenLastCalledWith("one");
  });

  it("scrolls to an initial fragment before processing intersections", () => {
    const { fragments, root } = fixture();
    const scrollTo = vi.fn();
    defaultProcessChanges(
      {
        entries: [],
        fragments,
        options: { initialFragment: "two" },
        rootElement: root,
        scrollSpy: { active: "", scrollTo } as unknown as NgbScrollSpyService,
      },
      vi.fn(),
      {},
    );
    expect(scrollTo).toHaveBeenCalledWith(root.children[1]);
  });

  it("clears the active fragment when scrolling above the first section", () => {
    const { elements, fragments, root } = fixture();
    const changeActive = vi.fn();
    const context = {};
    const scrollSpy = { active: "one" } as NgbScrollSpyService;

    defaultProcessChanges(
      {
        entries: [{ isIntersecting: true, target: elements[0] }] as IntersectionObserverEntry[],
        fragments,
        options: {},
        rootElement: root,
        scrollSpy,
      },
      changeActive,
      context,
    );
    defaultProcessChanges(
      {
        entries: [
          {
            boundingClientRect: { top: 10 },
            isIntersecting: false,
            rootBounds: { top: 0 },
            target: elements[0],
          },
        ] as unknown as IntersectionObserverEntry[],
        fragments,
        options: {},
        rootElement: root,
        scrollSpy,
      },
      changeActive,
      context,
    );
    expect(changeActive).toHaveBeenLastCalledWith("");
  });
});
