import type { NgbDropdown } from "@ngb/dropdown/ngb-dropdown.directive";
import { toNativeElement } from "@ngb/utils";
import type { IController, IDirective, IScope } from "angular";

const ALLOWED_KEYS = new Set(["ArrowUp", "ArrowDown", "Home", "End", "Tab"]);

export class NgbDropdownToggle implements IController {
	public ngbDropdown!: NgbDropdown;
	public nativeElement!: HTMLElement;

	private clickListener?: (event: JQueryEventObject) => void;
	private keydownListener?: (event: JQueryEventObject) => void;
	private unwatchOpenState?: () => void;

	constructor(
		private $element: JQLite,
		private $scope: IScope,
	) {}

	$onInit(): void {}

	$postLink(): void {
		this.nativeElement = toNativeElement(this.$element);
		this.$element.addClass("dropdown-toggle");
		this.ngbDropdown.registerAnchor(this);

		this.unwatchOpenState = this.$scope.$watch(
			() => this.ngbDropdown.isOpen(),
			(isOpen) => this._applyHostBindings(isOpen),
		);

		this.clickListener = () => {
			this.$scope.$evalAsync(() => {
				this.ngbDropdown.toggle();
			});
		};

		this.keydownListener = (event) => {
			if (!ALLOWED_KEYS.has(event.key)) return;

			this.ngbDropdown.onKeyDown(event);
		};

		this.$element.on("click", this.clickListener);
		this.$element.on("keydown", this.keydownListener);
	}

	$onDestroy(): void {
		if (this.clickListener) this.$element.off("click", this.clickListener);
		if (this.keydownListener)
			this.$element.off("keydown", this.keydownListener);
		this.unwatchOpenState?.();
	}

	private _applyHostBindings(isOpen = this.ngbDropdown.isOpen()) {
		this.$element.toggleClass("show", isOpen);
		this.$element.attr("aria-expanded", `${isOpen}`);
	}

	//#region $angular
	static get $name() {
		return "ngbDropdownToggle";
	}

	static get $factory(): () => IDirective {
		return () => ({
			bindToController: true,
			scope: true,
			require: {
				ngbDropdown: "^ngbDropdown",
			},
			controller: NgbDropdownToggle,
			restrict: "A",
		});
	}

	static get $inject() {
		return ["$element", "$scope"];
	}
	//#endregion
}
