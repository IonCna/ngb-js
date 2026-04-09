import type { IAugmentedJQuery, IPromise, IQService, ITimeoutService } from "angular";
import angular from "angular";
import { getTransitionDurationMs } from "@/utils/transition"
import { toNativeElement } from "@/utils"

export type NgbTransitionStartFn<T = any> = (
    element: IAugmentedJQuery,
    animation: boolean,
    context: T,
) => NgbTransitionEndFn | void;

export type NgbTransitionEndFn = () => void;

export interface NgbTransitionOptions<T> {
    animation: boolean;
    runningTransition: 'continue' | 'stop';
    context?: T;
}

export interface NgbTransitionCtx<T> {
    transition: IPromise<any>;
    complete: () => void;
    context: T;
}

const runningTransitions = new Map<IAugmentedJQuery, NgbTransitionCtx<any>>();

export const environment = {
    getTransitionTimerDelayMs: () => 5,
};

export function ngbRunTransition<T>(
    $q: IQService,
    $timeout: ITimeoutService,
    element: IAugmentedJQuery,
    startFn: NgbTransitionStartFn<T>,
    options: NgbTransitionOptions<T>,
): IPromise<void> {
    let context = options.context || <T>{}

    const running = runningTransitions.get(element)

    const events = {
        "continue": () => $q.when(),
        "stop": () => {
            running?.complete()
            context = angular.extend(running?.context, context)
            runningTransitions.delete(element)
        }
    }

    if (running) {
        const actionFn = events[options.runningTransition]
        actionFn()
    }

    const endFn = startFn(element, options.animation, context) || angular.noop

    const nativeElement = toNativeElement(element)
    const transitionDurationMs = getTransitionDurationMs(nativeElement)

    if (!options.animation || window.getComputedStyle(nativeElement).transitionProperty === 'none') {
        endFn()
        return $q.when()
    }

    const deferred = $q.defer<void>()
    let finished = false
    let timePromise: IPromise<void> | undefined

    const done = () => {
        if (finished) return
        finished = true

        element.off("transitionend", transitionEndHandler)

        if (timePromise) {
            $timeout.cancel(timePromise);
        }

        runningTransitions.delete(element);
        endFn();
        deferred.resolve();
    }

    const transitionEndHandler = (event: JQueryEventObject) => {
        if (event.target !== nativeElement) return;
        done();
    };

    runningTransitions.set(element, {
        transition: deferred.promise,
        complete: done,
        context,
    });

    element.on("transitionend", transitionEndHandler);
    timePromise = $timeout(done, transitionDurationMs + environment.getTransitionTimerDelayMs(), false)

    return deferred.promise
}

export function ngbCompleteTransition(element: IAugmentedJQuery) {
    runningTransitions.get(element)?.complete();
}