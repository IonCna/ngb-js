import { reflow, type NgbTransitionStartFn } from "@/utils";
import angular from "angular";

export const ngbModalWindowFadeInTransition: NgbTransitionStartFn = (element, animation) => {
    if(animation) {
        reflow(element)
    }

    element.addClass("show")
}

export const ngbModalBumpBackdropTransition: NgbTransitionStartFn = (element, animation) => {
    if(!animation) return angular.noop;

    element.addClass("modal-static")

    return () => {
        element.removeClass("modal-static")
    }
}

export const ngbModalWindowFadeOutTransition: NgbTransitionStartFn = (element) => {
    element.removeClass("show")
}

