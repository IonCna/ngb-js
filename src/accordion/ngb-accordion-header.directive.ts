import type { NgbAccordionItem } from "@ngb/accordion/ngb-accordion-item.directive";
import type {
	IAugmentedJQuery,
	IController,
	IDirective,
	IScope,
} from "angular";

export class NgbAccordionHeader implements IController {
	private item!: NgbAccordionItem;
	private collapseWatcher?: () => void;

	constructor(
		private $element: IAugmentedJQuery,
		private $scope: IScope,
	) {}

	$postLink(): void {
		this.$element.addClass("accordion-header");
		this.$element.attr("role", "heading");

		this.collapseWatcher = this.$scope.$watch(
			() => this.item.collapsed,
			(value) => {
				this.$element.toggleClass("collapsed", value);
			},
		);
	}

	$onDestroy(): void {
		this.collapseWatcher?.();
	}

	static get $name() {
		return "ngbAccordionHeader";
	}

	static get $inject() {
		return ["$element", "$scope"];
	}

	static get $factory(): () => IDirective {
		return () => ({
			bindToController: true,
			require: {
				item: "^ngbAccordionItem",
			},
			controller: NgbAccordionHeader,
			restrict: "A",
		});
	}
}
