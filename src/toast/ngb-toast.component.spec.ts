import type { ICompileService, IRootScopeService } from "angular";
import angular from "angular";
import { beforeEach, describe, expect, it } from "vitest";
import { NgbModule } from "../ngb.module";

describe("ngbToast", () => {
	let $compile: ICompileService;
	let $rootScope: IRootScopeService;

	beforeEach(() => {
		angular.mock.module(NgbModule.name);
		angular.mock.inject(
			(_$compile_: ICompileService, _$rootScope_: IRootScopeService) => {
				$compile = _$compile_;
				$rootScope = _$rootScope_;
			},
		);
	});

	it("sets bootstrap toast semantics on host element", () => {
		const scope = $rootScope.$new();
		const element = $compile(`<ngb-toast>Toast message</ngb-toast>`)(scope);
		scope.$digest();

		expect(element.attr("role")).toBe("alert");
		expect(element.attr("aria-atomic")).toBe("true");
		expect(element.hasClass("toast")).toBe(true);
		expect(element.hasClass("show")).toBe(true);
	});

	it("renders transcluded toast header content", () => {
		const scope = $rootScope.$new();
		const element = $compile(`
            <ngb-toast>
                <div ngb-toast-header><strong>Custom header</strong></div>
                Toast body
            </ngb-toast>
        `)(scope);
		scope.$digest();

		const nativeElement = element[0];
		const header = nativeElement.querySelector(".toast-header");
		const body = nativeElement.querySelector(".toast-body");

		expect(header?.textContent).toContain("Custom header");
		expect(body?.textContent).toContain("Toast body");
	});
});
