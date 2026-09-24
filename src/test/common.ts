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
