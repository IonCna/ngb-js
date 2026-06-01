import type { NgbDropdown } from "@ngb/dropdown/ngb-dropdown.directive";
import { toNativeElement } from "@ngb/utils";
import type { IController, IDirective, IScope } from "angular";

export class NgbDropdownAnchor implements IController {
	public dropdown!: NgbDropdown;
	public nativeElement!: HTMLElement;

	private unwatchOpenState?: () => void;

	constructor(
		private $element: JQLite,
		private $scope: IScope,
	) {}

	$postLink(): void {
		this.nativeElement = toNativeElement(this.$element);
		this.$element.addClass("dropdown-toggle");
		this.dropdown.registerAnchor(this);

		this.unwatchOpenState = this.$scope.$watch(
			() => this.dropdown.isOpen(),
			(isOpen) => this._applyHostBindings(isOpen),
		);
	}

	$onDestroy(): void {
		this.unwatchOpenState?.();
	}

	private _applyHostBindings(isOpen = this.dropdown.isOpen()) {
		this.$element.toggleClass("show", isOpen);
		this.$element.attr("aria-expanded", `${isOpen}`);
	}

	static get $inject() {
		return ["$element", "$scope"];
	}

	static get $name() {
		return "ngbDropdownAnchor";
	}

	static get $factory(): () => IDirective {
		return () => ({
			controller: NgbDropdownAnchor,
			restrict: "A",
			require: {
				dropdown: "^ngbDropdown",
			},
			bindToController: true,
			scope: true,
		});
	}
}
