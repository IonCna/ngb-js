import type { IComponentOptions } from "angular";
import template from "@demo/features/demo-progressbar/demo-progressbar.component.html";

export class DemoProgressbarComponent {
	static get $name() {
		return "ngbDemoProgressbar";
	}

	static get $factory(): IComponentOptions {
		return {
			controller: DemoProgressbarComponent,
			controllerAs: "$",
			template,
		};
	}
}
