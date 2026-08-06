import type { NgbTransitionStartFn } from "@ngb/utils";
import type { IAugmentedJQuery } from "angular";

export const ngbAlertFadingTransition: NgbTransitionStartFn = (element: IAugmentedJQuery) => {
  element.removeClass("show");
};
