import { type NgbTransitionStartFn, reflow } from "@ngb/utils";
import type { IAugmentedJQuery } from "angular";

export enum NgbSlideEventDirection {
	START = "start",
	END = "end",
}

export interface NgbCarouselCtx {
	direction: "start" | "end";
}

export function isBeingAnimated(element: IAugmentedJQuery) {
	return (
		element.hasClass("carousel-item-start") ||
		element.hasClass("carousel-item-end")
	);
}

function removeDirectionClasses(element: IAugmentedJQuery) {
	element.removeClass("carousel-item-start carousel-item-end");
}

function removeClasses(element: IAugmentedJQuery) {
	removeDirectionClasses(element);
	element.removeClass("carousel-item-prev carousel-item-next");
}

export const ngbCarouselTransitionIn: NgbTransitionStartFn<NgbCarouselCtx> = (
	element: IAugmentedJQuery,
	animation: boolean,
	{ direction }: NgbCarouselCtx,
) => {
	if (!animation) {
		removeClasses(element);
		element.addClass("active");
		return;
	}

	if (isBeingAnimated(element)) removeDirectionClasses(element);
	else {
		element.addClass(
			`carousel-item-${direction === NgbSlideEventDirection.START ? "next" : "prev"}`,
		);
		reflow(element);
		element.addClass(`carousel-item-${direction}`);
	}

	return () => {
		removeClasses(element);
		element.addClass("active");
	};
};

export const ngbCarouselTransitionOut: NgbTransitionStartFn<NgbCarouselCtx> = (
	element: IAugmentedJQuery,
	animation: boolean,
	{ direction }: NgbCarouselCtx,
) => {
	if (!animation) {
		removeClasses(element);
		element.removeClass("active");
		return;
	}

	if (isBeingAnimated(element)) removeDirectionClasses(element);
	else element.addClass(`carousel-item-${direction}`);

	return () => {
		removeClasses(element);
		element.removeClass("active");
	};
};
// NICE!
