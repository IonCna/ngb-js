import type { IAugmentedJQuery, IPromise, IQService, ITimeoutService } from "angular";
import angular from "angular";

const ALIASES: Record<string, string[]> = {
  hover: ["mouseenter", "mouseleave"],
  focus: ["focusin", "focusout"],
};

export function parseTriggers(triggers: string = ""): [string, string?][] {
  if (triggers.trim().length === 0) {
    return [];
  }

  const parsed = triggers
    .split(/\s+/)
    .map((trigger) => trigger.split(":"))
    .map((pair) => {
      const [firstPair] = pair;
      return (ALIASES[firstPair] || pair) as [string, string?];
    });

  const manual = parsed.filter((trigger) => trigger.includes("manual"));

  if (manual.length > 1) {
    throw new Error("Triggers parse error: only one manual trigger is allowed");
  }

  if (manual.length === 1 && parsed.length > 1) {
    throw new Error(`Triggers parse error: manual trigger can't be mixed with other triggers`);
  }

  return manual.length ? [] : parsed;
}

export function listenToTriggers(
  $timeout: ITimeoutService,
  $q: IQService,
  element: IAugmentedJQuery,
  triggers: string,
  isOpenFn: () => boolean,
  openFn: () => void,
  closeFn: () => void,
  openDelayMs = 0,
  closeDelayMs = 0,
  enterContent: IPromise<void>,
  leaveContent: IPromise<void>,
) {
  const activeOpenTriggers = new Set<string>();
  const cleanupFns: (() => void)[] = [];
  let timeout: IPromise<void>;
  const parsedTriggers = parseTriggers(triggers);

  if (parsedTriggers.length === 0) {
    return angular.noop;
  }

  function addEventListener(name: string, listener: () => void) {
    element.on(name, listener);
    cleanupFns.push(() => {
      return element.off(name, listener);
    });
  }

  function withDelay(fn: () => void, delayMs: number) {
    if (timeout) {
      $timeout.caller(timeout);
    }

    if (delayMs > 0) {
      timeout = $timeout(fn, delayMs);
      return;
    }

    fn();
  }

  for (const [openTrigger, closeTrigger] of parsedTriggers) {
    if (openTrigger === "mouseenter" && closeTrigger === "mouseleave" && closeDelayMs > 0) {
      const enterContentPromise = enterContent.then(() => {
        activeOpenTriggers.delete(openTrigger);
        $timeout.cancel(timeout);
      });

      const leaveContentPromise = leaveContent.then(() => {
        activeOpenTriggers.delete(openTrigger);
        withDelay(() => activeOpenTriggers.size === 0 && closeFn(), closeDelayMs);
      });

      cleanupFns.push(
        () => $q.resolve(enterContentPromise),
        () => $q.resolve(leaveContentPromise),
      );
    }

    if (!closeTrigger) {
      addEventListener(openTrigger, () => {
        activeOpenTriggers.add(openTrigger);
        return isOpenFn() ? withDelay(closeFn, closeDelayMs) : withDelay(openFn, openDelayMs);
      });

      continue;
    }

    addEventListener(openTrigger, () => {
      activeOpenTriggers.add(openTrigger);
      withDelay(() => activeOpenTriggers.size > 0 && openFn(), openDelayMs);
    });
    addEventListener(closeTrigger, () => {
      activeOpenTriggers.delete(openTrigger);
      withDelay(() => activeOpenTriggers.size === 0 && closeFn(), closeDelayMs);
    });
  }

  cleanupFns.push(() => $timeout.cancel(timeout));
  return () => {
    cleanupFns.forEach((fn) => {
      fn();
    });
  };
}
