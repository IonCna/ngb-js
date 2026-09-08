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

  it("reads the duration in seconds", () => {
    // Longhand: jsdom no expande el shorthand `transition:` a `transitionDuration`,
    // ni normaliza `ms`→`s` como un navegador real (por eso solo se prueba `s`).
    expect(getTransitionDurationMs(create("transition-duration: 0.01s"))).toBe(10);
  });

  it("adds transition delay", () => {
    expect(getTransitionDurationMs(create("transition-delay: 0.02s; transition-duration: 0.01s"))).toBe(30);
  });

  it("uses the first duration for multiple transitions", () => {
    expect(getTransitionDurationMs(create("transition-duration: 0.01s, 0.02s"))).toBe(10);
  });
});
