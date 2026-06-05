import { reflow, type NgbTransitionStartFn } from "@ngb/utils";

export const ngbNavFadeOutTransition: NgbTransitionStartFn = (element) => {
  element.removeClass("show");
  return () => element.removeClass("active");
};

export const ngbNavFadeInTransition: NgbTransitionStartFn = (element, animation) => {
  if (animation) {
    reflow(element);
  }

  element.addClass("show");
};
