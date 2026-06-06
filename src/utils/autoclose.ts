import { closest } from "@ngb/utils";
import angular, { type ITimeoutService } from "angular";
import { delay, filter, fromEvent, map, type Observable, race, takeUntil, tap, withLatestFrom } from "rxjs";

export enum SOURCE {
  ESCAPE,
  CLICK,
}

const isContainedIn = (element: HTMLElement, array?: HTMLElement[]) =>
  array ? array.some((item) => item.contains(element)) : false;

const matchesSelectorIfAny = (element: HTMLElement, selector?: string) =>
  !selector || closest(angular.element(element), selector) != null;

const isMobile = (() => {
  const isIOS = () => {
    const isIOSMobile = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const hasTouch = navigator.maxTouchPoints != null && navigator.maxTouchPoints > 2;
    const isMacintosh = /Macintosh/.test(navigator.userAgent);

    return isIOSMobile || (isMacintosh && hasTouch);
  };

  const isAndroid = () => /Android/.test(navigator.userAgent);

  return typeof navigator !== "undefined" ? !!navigator.userAgent && (isIOS() || isAndroid()) : false;
})();

const wrapAsyncForMobile = ($timeout: ITimeoutService, fn: () => void): (() => void) => {
  if (isMobile)
    return () => {
      void $timeout(fn, 100, false);
    };
  return fn;
};

export function ngbAutoClose(
  $timeout: ITimeoutService,
  type: boolean | "inside" | "outside",
  closed$: Observable<unknown>,
  close: (source: SOURCE) => void,
  insideElements: HTMLElement[],
  ignoreElements?: HTMLElement[],
  insideSelector?: string,
) {
  if (!type) return;

  wrapAsyncForMobile($timeout, () => {
    const shouldCloseOnClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return false;

      if (event.button === 2 || isContainedIn(target, ignoreElements)) {
        return false;
      }

      if (type === "inside") {
        return isContainedIn(target, insideElements) && matchesSelectorIfAny(target, insideSelector);
      }

      if (type === "outside") {
        return !isContainedIn(target, insideElements);
      }

      return matchesSelectorIfAny(target, insideSelector) || !isContainedIn(target, insideElements);
    };

    const escapes$ = fromEvent<KeyboardEvent>(document, "keydown").pipe(
      takeUntil(closed$),
      filter((event) => event.key === "Escape"),
      tap((event) => event.preventDefault()),
    );

    // Pre-calculate this on mousedown, because DOM nodes may be detached on mouseup.
    const mouseDowns$ = fromEvent<MouseEvent>(document, "mousedown").pipe(
      map(shouldCloseOnClick),
      takeUntil(closed$),
    );

    const closeableClicks$ = fromEvent<MouseEvent>(document, "mouseup").pipe(
      withLatestFrom(mouseDowns$),
      filter(([, shouldClose]) => shouldClose),
      delay(0),
      takeUntil(closed$),
    );

    race(escapes$.pipe(map(() => SOURCE.ESCAPE)), closeableClicks$.pipe(map(() => SOURCE.CLICK)))
      .pipe(takeUntil(closed$))
      .subscribe((source) => {
        void $timeout(() => close(source));
      });
  })();
}
