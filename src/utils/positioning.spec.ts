import type { Placement as PopperPlacement } from "@popperjs/core";
import { describe, expect, it } from "vitest";
import {
  getBootstrapBaseClassPlacement,
  getPopperClassPlacement,
  getPopperOptions,
  type Placement,
} from "./positioning";

describe("positioning mappings", () => {
  const ltr: Record<string, string> = {
    top: "top",
    bottom: "bottom",
    start: "left",
    end: "right",
    "top-start": "top-start",
    "top-end": "top-end",
    "bottom-start": "bottom-start",
    "bottom-end": "bottom-end",
    "start-top": "left-start",
    "start-bottom": "left-end",
    "end-top": "right-start",
    "end-bottom": "right-end",
  };

  it("maps Bootstrap placements to Popper placements", () => {
    for (const [bootstrap, popper] of Object.entries(ltr)) {
      expect(getPopperClassPlacement(bootstrap as Placement, false)).toBe(popper);
    }
  });

  it("flips logical placements in RTL without flipping physical placements", () => {
    expect(getPopperClassPlacement("start", true)).toBe("right");
    expect(getPopperClassPlacement("end-bottom", true)).toBe("left-end");
    expect(getPopperClassPlacement("left", true)).toBe("left");
    expect(getPopperClassPlacement("top-right", true)).toBe("top-end");
  });

  it("maps Popper placements back to Bootstrap class suffixes", () => {
    const mappings: Record<string, string> = {
      top: "top",
      left: "start",
      right: "end",
      "top-start": "top top-start",
      "bottom-end": "bottom bottom-end",
      "left-start": "start start-top",
      "right-end": "end end-bottom",
    };
    for (const [popper, bootstrap] of Object.entries(mappings)) {
      expect(getBootstrapBaseClassPlacement("", popper as PopperPlacement)).toBe(bootstrap);
    }
    expect(getBootstrapBaseClassPlacement("bs-tooltip", "top-start")).toBe("bs-tooltip-top bs-tooltip-top-start");
  });

  it("builds Popper fallback placements and Bootstrap modifier options", () => {
    const options = getPopperOptions(
      {
        baseClass: "bs-popover",
        hostElement: document.createElement("button"),
        placement: ["bottom-start", "top-start"],
        targetElement: document.createElement("div"),
      },
      { isRTL: () => false } as never,
    );
    expect(options.placement).toBe("bottom-start");
    // Hay dos modifiers `flip` (el importado aporta el `fn`, el segundo las `options`);
    // Popper los mergea por nombre. El que trae `fallbackPlacements` es el último.
    expect(options.modifiers?.findLast(({ name }) => name === "flip")?.options).toMatchObject({
      fallbackPlacements: ["top-start"],
    });
    expect(options.modifiers?.find(({ name }) => name === "bootstrapClasses")?.enabled).toBe(true);
  });
});
