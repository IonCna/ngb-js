import { type NgbTransitionStartFn, reflow } from "@ngb/utils";

export const ngbOffcanvasFadeInTransition: NgbTransitionStartFn = (element, animation) => {
  if (animation) {
    reflow(element);
  }

  element.classList.add("show");
};

export const ngbOffcanvasFadeOutTransition: NgbTransitionStartFn = (element) => {
  element.classList.remove("show");
};
