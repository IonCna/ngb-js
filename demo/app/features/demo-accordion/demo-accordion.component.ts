import type { IComponentController, IComponentOptions } from "angular";
import template from "@demo/features/demo-accordion/demo-accordion.component.html";

export class DemoAccordionComponent implements IComponentController {
	public firstCollapsed = false;
	public secondCollapsed = true;
	public thirdCollapsed = true;
	public closeOthers = true;
	public destroyOnHide = true;
	public animation = false;
	public secondDisabled = false;

	public toggleCloseOthers() {
		this.closeOthers = !this.closeOthers;
	}

	public toggleDestroyOnHide() {
		this.destroyOnHide = !this.destroyOnHide;
	}

	public toggleAnimation() {
		this.animation = !this.animation;
	}

	public toggleSecondDisabled() {
		this.secondDisabled = !this.secondDisabled;
	}

	static get $name() {
		return "ngbDemoAccordion";
	}

	static get $factory(): IComponentOptions {
		return {
			controller: DemoAccordionComponent,
			controllerAs: "$",
			template,
		};
	}
}
