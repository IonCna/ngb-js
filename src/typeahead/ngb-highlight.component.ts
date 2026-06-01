import type { IComponentController, IComponentOptions } from "angular";

export class NgbHighlight implements IComponentController {
	static get $name() {
		return "ngbHighlight";
	}

	static get $factory(): IComponentOptions {
		return {
			controller: NgbHighlight,
			controllerAs: "$",
			bindings: {
				term: "<?",
				result: "<?",
				highlightClass: "<?",
				accentSensitive: "<?",
			},
		};
	}
}
