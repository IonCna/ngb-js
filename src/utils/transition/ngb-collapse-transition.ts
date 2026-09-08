import { reflow } from "@ngb/utils/util";
import type { NgbTransitionStartFn } from "@ngb/utils/transition/ngb-transition";

type Dimension = "width" | "height";

export interface NgbCollapseCtx {
  direction: "show" | "hide";
  dimension: Dimension;
  maxSize?: string;
}

function measureCollapsingElementDimensionPx(element: HTMLElement, dimension: Dimension): string {
  if (typeof navigator === "undefined") {
    return "0px";
  }

  const { classList, style } = element;
  const hasShowClass = classList.contains("show");
  if (!hasShowClass) {
    classList.add("show");
  }

  style[dimension] = "";
  const dimensionSize = `${element.getBoundingClientRect()[dimension]}px`;

  if (!hasShowClass) {
    classList.remove("show");
  }

  return dimensionSize;
}

export const ngbCollapsingTransition: NgbTransitionStartFn<NgbCollapseCtx> = (
  element: HTMLElement,
  animation: boolean,
  context: NgbCollapseCtx,
) => {
  let { direction, maxSize, dimension } = context;
  const { classList } = element;

  const setInitialClasses = () => {
    classList.add("collapse");

    if (direction === "show") {
      classList.add("show");
      return;
    }

    classList.remove("show");
  };

  if (!animation) {
    setInitialClasses();
    return;
  }

  if (!context.maxSize) {
    maxSize = measureCollapsingElementDimensionPx(element, dimension);
    context.maxSize = maxSize;

    element.style[dimension] = direction !== "show" ? maxSize : "0px";

    classList.remove("collapse", "collapsing", "show");
    reflow(element);

    classList.add("collapsing");
  }

  element.style[dimension] = direction === "show" ? maxSize! : "0px";

  return () => {
    setInitialClasses();
    classList.remove("collapsing");
    element.style[dimension] = "";
  };
};
