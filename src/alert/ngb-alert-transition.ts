import type { IAugmentedJQuery } from "angular";

export function ngbAlertFadingTransition(
	element: IAugmentedJQuery,
	animation: boolean,
) {
	if (!animation) {
		element.addClass("opacity-0");
	}

	element.removeClass("show");
}
