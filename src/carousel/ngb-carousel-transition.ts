import { type NgbTransitionStartFn, reflow } from "@ngb/utils";

/**
 * Dirección de la transición entre slides del carousel.
 */
export enum NgbSlideEventDirection {
  START = "start",
  END = "end",
}

export interface NgbCarouselCtx {
  /**
   * Valores posibles: `'start' | 'end'`.
   */
  direction: "start" | "end";
}

const isBeingAnimated = ({ classList }: HTMLElement) => {
  return classList.contains("carousel-item-start") || classList.contains("carousel-item-end");
};

const removeDirectionClasses = (classList: DOMTokenList) => {
  classList.remove("carousel-item-start", "carousel-item-end");
};

const removeClasses = (classList: DOMTokenList) => {
  removeDirectionClasses(classList);
  classList.remove("carousel-item-prev", "carousel-item-next");
};

export const ngbCarouselTransitionIn: NgbTransitionStartFn<NgbCarouselCtx> = (
  element: HTMLElement,
  animation: boolean,
  { direction }: NgbCarouselCtx,
) => {
  const { classList } = element;

  if (!animation) {
    removeClasses(classList);
    classList.add("active");
    return;
  }

  if (isBeingAnimated(element)) {
    // Revierte la transición
    removeDirectionClasses(classList);
  } else {
    // Para la transición 'in' se aplica una 'pre-class' para asegurar visibilidad
    classList.add(`carousel-item-${direction === NgbSlideEventDirection.START ? "next" : "prev"}`);
    reflow(element);
    classList.add(`carousel-item-${direction}`);
  }

  return () => {
    removeClasses(classList);
    classList.add("active");
  };
};

export const ngbCarouselTransitionOut: NgbTransitionStartFn<NgbCarouselCtx> = (
  element: HTMLElement,
  animation: boolean,
  { direction }: NgbCarouselCtx,
) => {
  const { classList } = element;

  if (!animation) {
    removeClasses(classList);
    classList.remove("active");
    return;
  }

  //  direction es left o right, según hacia dónde sale el slide.
  if (isBeingAnimated(element)) {
    // Revierte la transición
    removeDirectionClasses(classList);
  } else {
    classList.add(`carousel-item-${direction}`);
  }

  return () => {
    removeClasses(classList);
    classList.remove("active");
  };
};
