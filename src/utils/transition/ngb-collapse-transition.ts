import { reflow } from "@ngb/utils";

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

export function ngbCollapsingTransition(element: HTMLElement, animation: boolean, context: NgbCollapseCtx) {
  const { classList, style } = element;

  const setInitialClasses = () => {
    classList.add("collapse");

    if (context.direction === "show") {
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
    context.maxSize = measureCollapsingElementDimensionPx(element, context.dimension);

    style[context.dimension] = context.direction !== "show" ? context.maxSize : "0px";

    classList.remove("collapse", "collapsing", "show");
    reflow(element);

    classList.add("collapsing");
  }

  if (!context.maxSize) throw new Error("[ngb-transition]: context.maxSize was undefined");

  style[context.dimension] = context.direction === "show" ? context.maxSize : "0px";

  return () => {
    setInitialClasses();
    classList.remove("collapsing");
    style[context.dimension] = "";
  };
}
