import { closest } from "@ngb/utils/util";
import type { NgZone } from "ngjs-core";
import { fromEvent, type Observable, race } from "rxjs";
import { delay, filter, map, takeUntil, tap, withLatestFrom } from "rxjs/operators";

const isContainedIn = (element: HTMLElement, array?: (HTMLElement | undefined)[]) =>
  array ? array.some((item) => item?.contains(element)) : false;

const matchesSelectorIfAny = (element: HTMLElement, selector?: string) =>
  !selector || closest(element, selector) != null;

const isMobile = (() => {
  const isIOS = () =>
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
  const isAndroid = () => /Android/.test(navigator.userAgent);

  return typeof navigator !== "undefined" ? !!navigator.userAgent && (isIOS() || isAndroid()) : false;
})();

const wrapAsyncForMobile = (fn: () => void) => (isMobile ? () => setTimeout(() => fn(), 100) : fn);

export const enum SOURCE {
  ESCAPE,
  CLICK,
}

export function ngbAutoClose(
  zone: NgZone,
  document: any,
  type: boolean | "inside" | "outside",
  close: (source: SOURCE) => void,
  closed$: Observable<any>,
  insideElements: HTMLElement[],
  ignoreElements?: HTMLElement[],
  insideSelector?: string,
) {
  if (type) {
    zone.runOutsideAngular(
      wrapAsyncForMobile(() => {
        const shouldCloseOnClick = (event: MouseEvent) => {
          const element = event.target as HTMLElement;
          if (event.button === 2 || isContainedIn(element, ignoreElements)) {
            return false;
          }
          if (type === "inside") {
            return isContainedIn(element, insideElements) && matchesSelectorIfAny(element, insideSelector);
          } else if (type === "outside") {
            return !isContainedIn(element, insideElements);
          } else {
            return matchesSelectorIfAny(element, insideSelector) || !isContainedIn(element, insideElements);
          }
        };

        const escapes$ = fromEvent<KeyboardEvent>(document, "keydown").pipe(
          takeUntil(closed$),
          filter((event) => event.key === "Escape"),
          tap((event) => event.preventDefault()),
        );

        const mouseDowns$ = fromEvent<MouseEvent>(document, "mousedown").pipe(
          map(shouldCloseOnClick),
          takeUntil(closed$),
        );

        const closeableClicks$ = fromEvent<MouseEvent>(document, "mouseup").pipe(
          withLatestFrom(mouseDowns$),
          filter(([, shouldClose]) => shouldClose),
          delay(0),
          takeUntil(closed$),
        ) as unknown as Observable<MouseEvent>;

        race([escapes$.pipe(map(() => SOURCE.ESCAPE)), closeableClicks$.pipe(map(() => SOURCE.CLICK))]).subscribe(
          (source: SOURCE) => zone.run(() => close(source)),
        );
      }),
    );
  }
}
