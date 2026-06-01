import type { ICompileService, IRootScopeService } from "angular";
import angular from "angular";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NgbModule } from "../ngb.module";

describe("ngbCollapse", () => {
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

	it("toggles show class and emits callbacks", () => {
		const scope = $rootScope.$new() as IRootScopeService & {
			isCollapsed: boolean;
			onHidden: () => void;
			onShown: () => void;
			onChange: () => void;
		};

		const onHidden = vi.fn();
		const onShown = vi.fn();
		const onChange = vi.fn();

		scope.isCollapsed = false;
		scope.onHidden = onHidden;
		scope.onShown = onShown;
		scope.onChange = onChange;

		const element = $compile(`
            <div ngb-collapse="isCollapsed"
                 animation="false"
                 ngb-hidden="onHidden()"
                 shown="onShown()"
                 ngb-collapse-change="onChange()">
                content
            </div>
        `)(scope);
		scope.$digest();

		expect(element.hasClass("collapse")).toBe(true);
		expect(element.hasClass("show")).toBe(true);

		scope.isCollapsed = true;
		scope.$digest();

		expect(element.hasClass("show")).toBe(false);
		expect(onHidden).toHaveBeenCalledTimes(1);
		expect(onChange).toHaveBeenCalledTimes(1);

		scope.isCollapsed = false;
		scope.$digest();

		expect(element.hasClass("show")).toBe(true);
		expect(onShown).toHaveBeenCalledTimes(1);
		expect(onChange).toHaveBeenCalledTimes(2);
	});

	it("adds horizontal class when configured", () => {
		const scope = $rootScope.$new() as IRootScopeService & {
			isCollapsed: boolean;
		};
		scope.isCollapsed = true;

		const element = $compile(
			`<div ngb-collapse="isCollapsed" animation="false" horizontal="true"></div>`,
		)(scope);
		scope.$digest();

		expect(element.hasClass("collapse-horizontal")).toBe(true);
	});
});
