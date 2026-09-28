import type { IInjectorService } from "angular";
import angular from "angular";
import { Injector } from "ngjs-core";
import { TestBed } from "ngjs-core/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NgbModule } from "../../ngb.module";
import { Live } from "./live";

describe("Live announcer", () => {
  let live: Live;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({ imports: [NgbModule] });
    live = TestBed.inject(Live);
  });

  afterEach(() => {
    live.ngOnDestroy();
    vi.useRealTimers();
  });

  it("creates the polite live region and announces text after the configured delay", () => {
    live.say("test");
    const element = document.body.querySelector<HTMLElement>("#ngb-live");
    expect(element).not.toBeNull();
    expect(element?.getAttribute("aria-live")).toBe("polite");
    expect(element?.getAttribute("aria-atomic")).toBe("true");
    expect(element?.classList.contains("visually-hidden")).toBe(true);
    expect(element?.textContent).toBe("");
    vi.advanceTimersByTime(100);
    expect(element?.textContent).toBe("test");
  });

  it("removes its live region on destroy", () => {
    live.say("test");
    live.ngOnDestroy();
    expect(document.body.querySelector("#ngb-live")).toBeNull();
  });
});
