import { type NgbTransitionStartFn, reflow } from "@ngb/utils";

export const ngbOffcanvasPanelShowTransition: NgbTransitionStartFn = (element, animation) => {
    if (animation) {
        reflow(element);
    }

    element.addClass("show showing");

    return () => {
        element.removeClass("showing");
    };
};

export const ngbOffcanvasPanelHideTransition: NgbTransitionStartFn = (element) => {
    element.removeClass("showing");
    element.addClass("hiding");

    return () => {
        element.removeClass("show hiding");
    };
};
