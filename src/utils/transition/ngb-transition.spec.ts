import type { NgZone } from "ngjs-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ngbCompleteTransition, ngbRunTransition } from "./ngb-transition";

describe("ngbRunTransition", () => {
  let element: HTMLDivElement;
  let zone: NgZone;

  beforeEach(() => {
    element = document.createElement("div");
    document.body.appendChild(element);
    zone = {
      run: <T>(fn: () => T) => fn(),
      runOutsideAngular: <T>(fn: () => T) => fn(),
    } as NgZone;
  });

  afterEach(() => element.remove());

  it("runs synchronously when animation is disabled", () => {
    const end = vi.fn();
    const next = vi.fn();
    const complete = vi.fn();
    const start = vi.fn(() => end);

    ngbRunTransition(zone, element, start, { animation: false, runningTransition: "continue" }).subscribe({
      complete,
      next,
    });

    expect(start).toHaveBeenCalledWith(element, false, {});
    expect(end).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith(undefined);
    expect(complete).toHaveBeenCalledOnce();
  });

  it("runs synchronously when CSS transition-property is none", () => {
    element.style.transitionProperty = "none";
    const end = vi.fn();
    const complete = vi.fn();
    ngbRunTransition(zone, element, () => end, { animation: true, runningTransition: "continue" }).subscribe({
      complete,
    });
    expect(end).toHaveBeenCalledOnce();
    expect(complete).toHaveBeenCalledOnce();
  });

  it("finishes an animated transition on transitionend from the target element", () => {
    element.style.transition = "opacity 10s";
    const end = vi.fn();
    const next = vi.fn();
    const complete = vi.fn();
    ngbRunTransition(zone, element, () => end, { animation: true, runningTransition: "continue" }).subscribe({
      complete,
      next,
    });

    element.dispatchEvent(new Event("transitionend"));
    expect(end).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith(undefined);
    expect(complete).toHaveBeenCalledOnce();
  });

  it("ignores transitionend events bubbling from descendants", () => {
    element.style.transition = "opacity 10s";
    const child = document.createElement("span");
    element.appendChild(child);
    const end = vi.fn();
    ngbRunTransition(zone, element, () => end, { animation: true, runningTransition: "continue" }).subscribe();

    child.dispatchEvent(new Event("transitionend", { bubbles: true }));
    expect(end).not.toHaveBeenCalled();
    ngbCompleteTransition(element);
    expect(end).toHaveBeenCalledOnce();
  });

  it("returns an empty observable when continuing an existing transition", () => {
    element.style.transition = "opacity 10s";
    const firstStart = vi.fn();
    const secondStart = vi.fn();
    const secondComplete = vi.fn();
    ngbRunTransition(zone, element, firstStart, { animation: true, runningTransition: "continue" }).subscribe();
    ngbRunTransition(zone, element, secondStart, { animation: true, runningTransition: "continue" }).subscribe({
      complete: secondComplete,
    });

    expect(firstStart).toHaveBeenCalledOnce();
    expect(secondStart).not.toHaveBeenCalled();
    expect(secondComplete).toHaveBeenCalledOnce();
    ngbCompleteTransition(element);
  });

  it("stops an existing transition and merges its context into the replacement", () => {
    element.style.transition = "opacity 10s";
    const firstComplete = vi.fn();
    const replacementContext = vi.fn();
    ngbRunTransition(zone, element, () => undefined, {
      animation: true,
      context: { count: 1, label: "first" },
      runningTransition: "stop",
    }).subscribe({ complete: firstComplete });

    ngbRunTransition(zone, element, (_element, _animation, context) => replacementContext({ ...context }), {
      animation: true,
      context: { label: "second" },
      runningTransition: "stop",
    }).subscribe();

    expect(firstComplete).toHaveBeenCalledOnce();
    expect(replacementContext).toHaveBeenCalledWith({ count: 1, label: "second" });
    ngbCompleteTransition(element);
  });
});
