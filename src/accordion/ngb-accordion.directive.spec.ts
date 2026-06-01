import type {
	ICompileService,
	IProvideService,
	IRootScopeService,
} from "angular";
import angular from "angular";
import { beforeEach, describe, expect, it } from "vitest";
import { NgbModule } from "../ngb.module";

describe("ngbAccordion", () => {
	let $compile: ICompileService;
	let $rootScope: IRootScopeService;

	beforeEach(() => {
		angular.mock.module(NgbModule.name);
		angular.mock.module(($provide: IProvideService) => {
			$provide.value("ngb.config.service", { animation: false });
		});
		angular.mock.inject(
			(_$compile_: ICompileService, _$rootScope_: IRootScopeService) => {
				$compile = _$compile_;
				$rootScope = _$rootScope_;
			},
		);
	});

	it("respects close-others when toggling items", () => {
		const scope = $rootScope.$new() as IRootScopeService & {
			firstCollapsed: boolean;
			secondCollapsed: boolean;
		};

		scope.firstCollapsed = false;
		scope.secondCollapsed = true;

		const element = $compile(`
            <div ngb-accordion close-others="true" animation="false">
                <div ngb-accordion-item="'first'" collapsed="firstCollapsed">
                    <h2 ngb-accordion-header>
                        <button ngb-accordion-button>First</button>
                    </h2>
                    <div ngb-accordion-collapse>
                        <div ngb-accordion-body>First body</div>
                    </div>
                </div>
                <div ngb-accordion-item="'second'" collapsed="secondCollapsed">
                    <h2 ngb-accordion-header>
                        <button ngb-accordion-button>Second</button>
                    </h2>
                    <div ngb-accordion-collapse>
                        <div ngb-accordion-body>Second body</div>
                    </div>
                </div>
            </div>
        `)(scope);
		scope.$digest();

		expect(element.hasClass("accordion")).toBe(true);

		const buttons = element[0].querySelectorAll("button[ngb-accordion-button]");
		expect(buttons[0]?.getAttribute("aria-expanded")).toBe("true");
		expect(buttons[1]?.getAttribute("aria-expanded")).toBe("false");

		angular.element(buttons[1]).triggerHandler("click");
		scope.$digest();

		expect(scope.firstCollapsed).toBe(true);
		expect(scope.secondCollapsed).toBe(false);
		expect(buttons[0]?.getAttribute("aria-expanded")).toBe("false");
		expect(buttons[1]?.getAttribute("aria-expanded")).toBe("true");
	});
});
