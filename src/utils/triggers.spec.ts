import { Subject } from "rxjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listenToTriggers, parseTriggers } from "./triggers";

describe("trigger utilities", () => {
  it("parses single, paired and multiple triggers", () => {
    expect(parseTriggers("foo")).toEqual([["foo"]]);
    expect(parseTriggers("foo:bar")).toEqual([["foo", "bar"]]);
    expect(parseTriggers(" foo   bar:baz\nqux ")).toEqual([["foo"], ["bar", "baz"], ["qux"]]);
  });

  it("expands focus and hover aliases", () => {
    expect(parseTriggers("hover focus")).toEqual([
      ["mouseenter", "mouseleave"],
      ["focusin", "focusout"],
    ]);
  });

  it("supports manual and empty trigger declarations", () => {
    expect(parseTriggers("manual")).toEqual([]);
    expect(parseTriggers("")).toEqual([]);
    expect(parseTriggers(null as unknown as string)).toEqual([]);
  });

  it("rejects invalid manual trigger combinations", () => {
    expect(() => parseTriggers("manual click manual")).toThrow("only one manual trigger");
    expect(() => parseTriggers("click manual")).toThrow("manual trigger can't be mixed");
  });

  describe("listenToTriggers", () => {
    let element: HTMLDivElement;
    let opened: boolean;
    let open: ReturnType<typeof vi.fn>;
    let close: ReturnType<typeof vi.fn>;
    let cleanup: () => void;

    beforeEach(() => {
      vi.useFakeTimers();
      element = document.createElement("div");
      opened = false;
      open = vi.fn(() => {
        opened = true;
      });
      close = vi.fn(() => {
        opened = false;
      });
      cleanup = () => undefined;
    });

    afterEach(() => {
      cleanup();
      vi.useRealTimers();
    });

    it("toggles for a single click trigger", () => {
      cleanup = listenToTriggers(element, "click", () => opened, open, close);
      element.click();
      element.click();
      expect(open).toHaveBeenCalledTimes(1);
      expect(close).toHaveBeenCalledTimes(1);
    });

    it("keeps content open while any paired trigger remains active", () => {
      cleanup = listenToTriggers(element, "hover focus", () => opened, open, close);
      element.dispatchEvent(new MouseEvent("mouseenter"));
      element.dispatchEvent(new FocusEvent("focusin"));
      element.dispatchEvent(new MouseEvent("mouseleave"));
      expect(close).not.toHaveBeenCalled();
      element.dispatchEvent(new FocusEvent("focusout"));
      expect(close).toHaveBeenCalledOnce();
    });

    it("honors and cancels open and close delays", () => {
      cleanup = listenToTriggers(element, "hover", () => opened, open, close, 100, 100);
      element.dispatchEvent(new MouseEvent("mouseenter"));
      expect(open).not.toHaveBeenCalled();
      vi.advanceTimersByTime(100);
      expect(open).toHaveBeenCalledOnce();

      element.dispatchEvent(new MouseEvent("mouseleave"));
      vi.advanceTimersByTime(50);
      element.dispatchEvent(new MouseEvent("mouseenter"));
      vi.advanceTimersByTime(100);
      expect(close).not.toHaveBeenCalled();
    });

    it("coordinates delayed hover closing with projected content", () => {
      const enterContent = new Subject<void>();
      const leaveContent = new Subject<void>();
      cleanup = listenToTriggers(element, "hover", () => opened, open, close, 0, 100, enterContent, leaveContent);
      element.dispatchEvent(new MouseEvent("mouseenter"));
      element.dispatchEvent(new MouseEvent("mouseleave"));
      enterContent.next();
      vi.advanceTimersByTime(100);
      expect(close).not.toHaveBeenCalled();

      leaveContent.next();
      vi.advanceTimersByTime(100);
      expect(close).toHaveBeenCalledOnce();
    });

    it("removes listeners and clears pending timers on cleanup", () => {
      cleanup = listenToTriggers(element, "hover", () => opened, open, close, 100);
      element.dispatchEvent(new MouseEvent("mouseenter"));
      cleanup();
      vi.advanceTimersByTime(100);
      element.dispatchEvent(new MouseEvent("mouseenter"));
      expect(open).not.toHaveBeenCalled();
      cleanup = () => undefined;
    });
  });
});
