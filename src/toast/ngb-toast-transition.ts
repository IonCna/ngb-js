import { reflow, type NgbTransitionStartFn } from "@ngb/utils";

export const ngbToastFadeInTransition: NgbTransitionStartFn = (element: HTMLElement, animation: boolean) => {
  const { classList } = element;

  if (animation) {
    classList.add("fade");
  } else {
    classList.add("show");
    return;
  }

  reflow(element);
  classList.add("show", "showing");

  return () => {
    classList.remove("showing");
  };
};

export const ngbToastFadeOutTransition: NgbTransitionStartFn = ({ classList }: HTMLElement) => {
  classList.add("showing");
  return () => {
    classList.remove("show", "showing");
  };
};
