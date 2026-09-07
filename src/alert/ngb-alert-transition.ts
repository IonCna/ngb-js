import type { NgbTransitionStartFn } from "@ngb/utils";

export const ngbAlertFadingTransition: NgbTransitionStartFn = ({ classList }: HTMLElement) => {
  classList.remove("show");
};
