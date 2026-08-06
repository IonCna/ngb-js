import { runInZone, toNativeElement } from "@ngb/utils";
import { getTransitionDurationMs } from "@ngb/utils/transition";
import type { IAugmentedJQuery } from "angular";
import angular from "angular";
import type { NgZone } from "ngjs-core";
import { EMPTY, endWith, filter, fromEvent, type Observable, of, race, Subject, takeUntil, timer } from "rxjs";

export type NgbTransitionStartFn<T = unknown> = (
  element: IAugmentedJQuery,
  animation: boolean,
  context: T,
) => NgbTransitionEndFn | undefined;

export type NgbTransitionEndFn = () => void;

export interface NgbTransitionOptions<T> {
  animation: boolean;
  runningTransition: "continue" | "stop";
  context?: T;
}

export interface NgbTransitionCtx<T> {
  transition$: Subject<void>;
  complete: () => void;
  context: T;
}

const noopFn = angular.noop;

export const environment = {
  getTransitionTimerDelayMs: () => 5,
};

const runningTransitions = new Map<HTMLElement, NgbTransitionCtx<unknown>>();

export function ngbRunTransition<T>(
  ngZone: NgZone,
  element: IAugmentedJQuery,
  startFn: NgbTransitionStartFn<T>,
  options: NgbTransitionOptions<T>,
): Observable<void> {
  let context = options.context ?? <T>{};
  const nativeElement = toNativeElement(element);

  const running = runningTransitions.get(nativeElement);

  if (running) {
    if (options.runningTransition === "continue") {
      return EMPTY;
    }

    ngZone.run(() => running.transition$.complete());
    context = angular.extend(running.context, context);
    runningTransitions.delete(nativeElement);
  }

  const endFn = startFn(element, options.animation, context) || noopFn;

  if (!options.animation || window.getComputedStyle(nativeElement).transitionProperty === "none") {
    ngZone.run(() => endFn());
    return of(undefined).pipe(runInZone(ngZone));
  }

  const transition$ = new Subject<void>();
  const finishTransition$ = new Subject<void>();
  const stop$ = transition$.pipe(endWith(true));

  runningTransitions.set(nativeElement, {
    transition$,
    complete: () => {
      finishTransition$.next();
      finishTransition$.complete();
    },
    context,
  });

  const transitionDurationMs = getTransitionDurationMs(nativeElement);

  ngZone.runOutsideAngular(() => {
    const transitionEnd$ = fromEvent(nativeElement, "transitionend").pipe(
      takeUntil(stop$),
      filter(({ target }) => target === nativeElement),
    );

    const timer$ = timer(transitionDurationMs + environment.getTransitionTimerDelayMs()).pipe(takeUntil(stop$));

    race(timer$, transitionEnd$, finishTransition$)
      .pipe(takeUntil(stop$))
      .subscribe(() => {
        runningTransitions.delete(nativeElement);
        ngZone.run(() => {
          endFn();
          transition$.next();
          transition$.complete();
        });
      });
  });

  return transition$.asObservable();
}

export function ngbCompleteTransition(element: IAugmentedJQuery) {
  runningTransitions.get(toNativeElement(element))?.complete();
}
