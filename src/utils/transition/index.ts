export * from "@ngb/utils/transition/ngb-collapse-transition";
export * from "@ngb/utils/transition/ngb-transition";

export function getTransitionDurationMs(element: HTMLElement) {
  const { transitionDelay, transitionDuration } = window.getComputedStyle(element);
  const transitionDelaySec = parseFloat(transitionDelay);
  const transitionDurationSec = parseFloat(transitionDuration);

  return (transitionDelaySec + transitionDurationSec) * 1000;
}

export interface INgbEvent<T> {
  $event: T;
}
