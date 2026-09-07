import { getTransitionDurationMs } from "@ngb/utils/transition/util";
import { runInZone } from "@ngb/utils/util";
import type { NgZone } from "ngjs-core";
import { EMPTY, endWith, filter, fromEvent, type Observable, of, race, Subject, takeUntil, timer } from "rxjs";

export type NgbTransitionStartFn<T = any> = (
  element: HTMLElement,
  animation: boolean,
  context: T,
) => NgbTransitionEndFn | void;

export type NgbTransitionEndFn = () => void;

export interface NgbTransitionOptions<T> {
  animation: boolean;
  runningTransition: "continue" | "stop";
  context?: T;
}

export interface NgbTransitionCtx<T> {
  // biome-ignore lint/suspicious/noExplicitAny: port textual de @ng-bootstrap
  transition$: Subject<any>;
  complete: () => void;
  context: T;
}

const noopFn: NgbTransitionEndFn = () => {};

export const environment = {
  getTransitionTimerDelayMs: () => 5,
};

// biome-ignore lint/suspicious/noExplicitAny: port textual
const runningTransitions = new Map<HTMLElement, NgbTransitionCtx<any>>();

/**
 * Port textual del `ngbRunTransition` de `@ng-bootstrap`
 * (`utils/transition/ngbTransition.ts`). Opera sobre `HTMLElement` crudo — los
 * consumidores le pasan `elementRef.nativeElement`.
 */
export const ngbRunTransition = <T>(
  zone: NgZone,
  element: HTMLElement,
  startFn: NgbTransitionStartFn<T>,
  options: NgbTransitionOptions<T>,
): Observable<void> => {
  let context = options.context || <T>{};

  const running = runningTransitions.get(element);
  if (running) {
    switch (options.runningTransition) {
      case "continue":
        return EMPTY;
      case "stop":
        zone.run(() => running.transition$.complete());
        context = Object.assign(running.context, context);
        runningTransitions.delete(element);
    }
  }

  const endFn = startFn(element, options.animation, context) || noopFn;

  if (!options.animation || window.getComputedStyle(element).transitionProperty === "none") {
    zone.run(() => endFn());
    return of(undefined).pipe(runInZone(zone));
  }

  const transition$ = new Subject<void>();
  const finishTransition$ = new Subject<void>();
  const stop$ = transition$.pipe(endWith(true));
  runningTransitions.set(element, {
    transition$,
    complete: () => {
      finishTransition$.next();
      finishTransition$.complete();
    },
    context,
  });

  const transitionDurationMs = getTransitionDurationMs(element);

  zone.runOutsideAngular(() => {
    const transitionEnd$ = fromEvent(element, "transitionend").pipe(
      takeUntil(stop$),
      filter(({ target }) => target === element),
    );
    const timer$ = timer(transitionDurationMs + environment.getTransitionTimerDelayMs()).pipe(takeUntil(stop$));

    race(timer$, transitionEnd$, finishTransition$)
      .pipe(takeUntil(stop$))
      .subscribe(() => {
        runningTransitions.delete(element);
        zone.run(() => {
          endFn();
          transition$.next();
          transition$.complete();
        });
      });
  });

  return transition$.asObservable();
};

export const ngbCompleteTransition = (element: HTMLElement) => {
  runningTransitions.get(element)?.complete();
};
