import type {
	IComponentController,
	IComponentOptions,
	ITimeoutService,
} from "angular";
import template from "@demo/features/demo-toast/demo-toast.component.html";

export class DemoToastComponent implements IComponentController {
	public animation = true;
	public autohide = false;
	public delay = 5000;
	public showToast = true;
	public lastEvent = "Ready";

	constructor(private $timeout: ITimeoutService) {}

	public toggleAnimation() {
		this.animation = !this.animation;
	}

	public toggleAutohide() {
		this.autohide = !this.autohide;
		this.refresh();
	}

	public toggleToast() {
		this.showToast = !this.showToast;
	}

	public refresh() {
		this.showToast = false;
		this.$timeout(() => {
			this.showToast = true;
		});
	}

	public onShown() {
		this.lastEvent = "Toast shown";
	}

	public onHidden() {
		this.lastEvent = "Toast hidden";
	}

	static get $name() {
		return "ngbDemoToast";
	}

	static get $inject() {
		return ["$timeout"];
	}

	static get $factory(): IComponentOptions {
		return {
			controller: DemoToastComponent,
			controllerAs: "$",
			template,
		};
	}
}
