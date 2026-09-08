import { type NgbTransitionStartFn, reflow } from "@ngb/utils";

export const ngbOffcanvasPanelShowTransition: NgbTransitionStartFn = (element, animation) => {
  if (animation) {
    reflow(element);
  }

  element.classList.add("show", "showing");

  return () => {
    element.classList.remove("showing");
  };
};

export const ngbOffcanvasPanelHideTransition: NgbTransitionStartFn = (element) => {
  element.classList.remove("showing");
  element.classList.add("hiding");

  return () => {
    element.classList.remove("show", "hiding");
  };
};
