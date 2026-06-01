import template from "@ngb/tooltip/ngb-tooltip-window.component.html";
import type { IComponentController, IComponentOptions } from "angular";

export class NgbTooltipWindow implements IComponentController {
	public id?: string;
	public animation?: boolean;
	public tooltipClass?: string;
	public onMouseEnter?: () => void;
	public onMouseLeave?: () => void;

	constructor(private $element: JQLite) {}

	$postLink(): void {
		this.$element.attr("role", "tooltip");
		this.id = this.$element.attr("id");
	}

	$onChanges(): void {
		this.$element.toggleClass("fade", this.animation);
	}

	static get $inject() {
		return ["$element"];
	}

	static get $factory(): IComponentOptions {
		return {
			controller: NgbTooltipWindow,
			controllerAs: "$",
			transclude: true,
			bindings: {
				animation: "<?",
				tooltipClass: "@?",
				onMouseEnter: "&?",
				onMouseLeave: "&?",
			},
			template,
		};
	}

	static get $name() {
		return "ngbTooltipWindow";
	}
}
