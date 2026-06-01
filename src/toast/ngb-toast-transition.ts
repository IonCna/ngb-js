import type { NgbTransitionStartFn } from "@ngb/utils";
import { reflow } from "@ngb/utils";
import angular from "angular";

export const ngbToastFadeInTransition: NgbTransitionStartFn = (element, animation) => {
  if (!animation) {
    element.addClass("show");
    return angular.noop;
  }

  element.addClass("fade");

  reflow(element);
  element.addClass("show showing");

  return () => {
    element.removeClass("showing");
  };
};

export const ngbToastFadeOutTransition: NgbTransitionStartFn = (element, animation) => {
  element.addClass("showing");

  return () => {
    if (!animation) {
      element.removeClass("d-block");
      return;
    }

    element.removeClass("show showing");
  };
};
