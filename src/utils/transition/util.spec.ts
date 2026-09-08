import { afterEach, describe, expect, it } from "vitest";
import { getTransitionDurationMs } from "./util";

describe("getTransitionDurationMs", () => {
  let element: HTMLElement;

  function create(style = "") {
    element = document.createElement("div");
    element.setAttribute("style", style);
    document.body.appendChild(element);
    return element;
  }

  afterEach(() => element?.remove());

  it("returns zero when no transition is set", () => {
    expect(getTransitionDurationMs(create())).toBe(0);
  });

  it("reads seconds and milliseconds", () => {
    expect(getTransitionDurationMs(create("transition: opacity 0.01s linear"))).toBe(10);
    element.remove();
    expect(getTransitionDurationMs(create("transition: opacity 10ms linear"))).toBe(10);
  });

  it("adds transition delay", () => {
    expect(getTransitionDurationMs(create("transition-delay: 0.02s; transition-duration: 0.01s"))).toBe(30);
  });

  it("uses the first duration for multiple transitions", () => {
    expect(getTransitionDurationMs(create("transition: opacity 0.01s, color 0.02s"))).toBe(10);
  });
});
