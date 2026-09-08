import type { NgZone } from "ngjs-core";
import { fromEvent, type Observable } from "rxjs";
import { filter, map, takeUntil, withLatestFrom } from "rxjs/operators";

export const FOCUSABLE_ELEMENTS_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[contenteditable]",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

export function getFocusableBoundaryElements(element: HTMLElement): HTMLElement[] {
  const list: HTMLElement[] = Array.from(
    element.querySelectorAll(FOCUSABLE_ELEMENTS_SELECTOR) as NodeListOf<HTMLElement>,
  ).filter((el) => el.tabIndex !== -1);
  return [list[0], list[list.length - 1]];
}

export const ngbFocusTrap = (
  zone: NgZone,
  element: HTMLElement,
  stopFocusTrap$: Observable<any>,
  refocusOnClick = false,
) => {
  zone.runOutsideAngular(() => {
    const lastFocusedElement$ = fromEvent<FocusEvent>(element, "focusin").pipe(
      takeUntil(stopFocusTrap$),
      map((event) => event.target),
    );

    fromEvent<KeyboardEvent>(element, "keydown")
      .pipe(
        takeUntil(stopFocusTrap$),
        filter((event) => event.key === "Tab"),
        withLatestFrom(lastFocusedElement$),
      )
      .subscribe(([tabEvent, focusedElement]) => {
        const [first, last] = getFocusableBoundaryElements(element);

        if ((focusedElement === first || focusedElement === element) && tabEvent.shiftKey) {
          last.focus();
          tabEvent.preventDefault();
        }

        if (focusedElement === last && !tabEvent.shiftKey) {
          first.focus();
          tabEvent.preventDefault();
        }
      });

    if (refocusOnClick) {
      fromEvent(element, "click")
        .pipe(
          takeUntil(stopFocusTrap$),
          withLatestFrom(lastFocusedElement$),
          map((array) => array[1] as HTMLElement),
        )
        .subscribe((lastFocusedElement) => lastFocusedElement.focus());
    }
  });
};
