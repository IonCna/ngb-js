import { type NgbTransitionStartFn, reflow } from "@ngb/utils";

export const ngbModalBackdropFadeOutTransition: NgbTransitionStartFn = (element) => {
  element.removeClass("show");
};

export const ngbModalBackdropFadeInTransition: NgbTransitionStartFn = (element, animation) => {
  if (animation) {
    reflow(element);
  }

  element.addClass("show");
};
