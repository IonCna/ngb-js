import { closest } from "@ngb/utils";
import type { DigestService } from "@ngb/utils/digest.service";
import angular from "angular";
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

const wrapAsyncForMobile = (digestService: DigestService, fn: () => void): (() => void) => {
  if (isMobile)
    return () => {
      digestService.runOutsideDigest(fn, 100);
    };
  return fn;
};

export function ngbAutoClose(
  digestService: DigestService,
  type: boolean | "inside" | "outside",
  closed$: Observable<unknown>,
  close: (source: SOURCE) => void,
  insideElements: HTMLElement[],
  ignoreElements?: HTMLElement[],
  insideSelector?: string,
) {
  if (!type) return;

  wrapAsyncForMobile(digestService, () => {
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
        digestService.runInsideDigest(() => close(source));
      });
  })();
}
