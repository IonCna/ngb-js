import { Key } from "@ngb/utils/key";
import { type ComponentFixture, TestBed } from "ngjs-core/testing";

/** Port de `test/common.ts` de ng-bootstrap (lo que usan los specs de alert). */
export function createGenericTestComponent<T>(
  html: string,
  type: { new (...args: any[]): T },
  detectChanges = true,
): ComponentFixture<T> {
  TestBed.overrideComponent(type, { set: { template: html } });
  const fixture = TestBed.createComponent(type);
  if (detectChanges) {
    fixture.detectChanges();
  }
  return fixture as ComponentFixture<T>;
}

export function isBrowserVisible(suiteName: string) {
  if (document.hidden) {
    console.warn(`${suiteName} tests were skipped because browser tab running these tests is hidden or inactive`);
    return false;
  }
  return true;
}

/**
 * `KeyboardEvent` real con `which`/`keyCode` (jsdom no los toma del init), como el `createKeyEvent` de ng-bootstrap.
 * También lleva `key` (`"ArrowDown"`, `" "`, …): los `@HostListener("keydown.arrowdown")` filtran por él.
 */
export function createKeyEvent(
  key: Key,
  options: { type: "keyup" | "keydown"; bubbles?: boolean; shiftKey?: boolean } = { type: "keyup" },
): KeyboardEvent {
  const name = Key[key] === "Space" ? " " : Key[key];
  const event = new KeyboardEvent(options.type, {
    key: name,
    bubbles: options.bubbles ?? true,
    cancelable: true,
    shiftKey: options.shiftKey ?? false,
  });
  Object.defineProperties(event, { which: { get: () => key }, keyCode: { get: () => key } });
  return event;
}

export function triggerEvent(element: HTMLElement, eventName: string) {
  element.dispatchEvent(new Event(eventName, { bubbles: true, cancelable: false }));
}
