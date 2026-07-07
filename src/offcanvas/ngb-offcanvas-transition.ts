import { reflow, type NgbTransitionStartFn } from "@ngb/utils";

export const ngbOffcanvasFadeInTransition: NgbTransitionStartFn = (element, animation) => {
    if (animation) {
        reflow(element);
    }

    element.addClass('show');
}

export const ngbOffcanvasFadeOutTransition: NgbTransitionStartFn = (element) => {
    element.removeClass('show')
}