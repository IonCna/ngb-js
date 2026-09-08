import { reflow, type NgbTransitionStartFn } from "@ngb/utils";

export const ngbNavFadeOutTransition: NgbTransitionStartFn = (element) => {
  element.classList.remove("show");
  return () => element.classList.remove("active");
};

export const ngbNavFadeInTransition: NgbTransitionStartFn = (element, animation) => {
  if (animation) {
    reflow(element);
  }

  element.classList.add("show");
};
