import type { ICompileService, IInjectorService, IRootScopeService } from "angular";
import angular from "angular";
import { Injector } from "ngjs-core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NgbModule } from "../ngb.module";
import type { NgbCollapse } from "./ngb-collapse.directive";
import { NgbCollapseConfig } from "./ngb-collapse-config.service";

describe("ngbCollapse", () => {
  let $compile: ICompileService;
  let $rootScope: IRootScopeService;
  let config: NgbCollapseConfig;

  beforeEach(() => {
    angular.mock.module(NgbModule.name);
    angular.mock.inject(
      (_$compile_: ICompileService, _$rootScope_: IRootScopeService, _$injector_: IInjectorService) => {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        config = _$injector_.get<Injector>(Injector.$name).get(NgbCollapseConfig);
      },
    );
  });

  it("responds to bound model changes and emits transition callbacks", () => {
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
                 hidden="onHidden()"
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
    expect(onChange).not.toHaveBeenCalled();

    scope.isCollapsed = false;
    scope.$digest();

    expect(element.hasClass("show")).toBe(true);
    expect(onShown).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("toggles programmatically and emits the collapsed state", () => {
    const scope = $rootScope.$new() as IRootScopeService & {
      onChange: (collapsed: boolean) => void;
    };
    const onChange = vi.fn();
    scope.onChange = onChange;

    const element = $compile(`
      <div ngb-collapse animation="false" ngb-collapse-change="onChange($event)"></div>
    `)(scope);
    scope.$digest();

    const collapse = element.controller<NgbCollapse>("ngbCollapse");

    collapse.toggle();

    expect(element.hasClass("show")).toBe(false);
    expect(onChange).toHaveBeenLastCalledWith(true);

    collapse.toggle();

    expect(element.hasClass("show")).toBe(true);
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it("adds horizontal class when configured", () => {
    const scope = $rootScope.$new() as IRootScopeService & {
      isCollapsed: boolean;
    };
    scope.isCollapsed = true;

    const element = $compile(`<div ngb-collapse="isCollapsed" animation="false" horizontal="true"></div>`)(scope);
    scope.$digest();

    expect(element.hasClass("collapse-horizontal")).toBe(true);
  });

  it("uses horizontal configuration by default", () => {
    config.horizontal = true;

    const element = $compile(`<div ngb-collapse="false" animation="false"></div>`)($rootScope.$new());
    $rootScope.$digest();

    expect(element.hasClass("collapse-horizontal")).toBe(true);
  });

  it.each([
    [false, true],
    [true, false],
  ])("initializes collapsed=%s with show=%s", (collapsed, shown) => {
    const scope = $rootScope.$new() as IRootScopeService & { collapsed: boolean };
    scope.collapsed = collapsed;
    const element = $compile(`<div ngb-collapse="collapsed" animation="false">content</div>`)(scope);
    scope.$digest();
    expect(element.hasClass("collapse")).toBe(true);
    expect(element.hasClass("show")).toBe(shown);
    expect(element.text().trim()).toBe("content");
  });

  it("works without an input binding", () => {
    const element = $compile(`<div ngb-collapse animation="false">content</div>`)($rootScope.$new());
    $rootScope.$digest();
    expect(element.hasClass("show")).toBe(true);
  });

  it("reacts to horizontal input changes", () => {
    const scope = $rootScope.$new() as IRootScopeService & { horizontal: boolean };
    scope.horizontal = false;
    const element = $compile(`<div ngb-collapse="false" animation="false" horizontal="horizontal"></div>`)(scope);
    scope.$digest();
    expect(element.hasClass("collapse-horizontal")).toBe(false);
    scope.horizontal = true;
    scope.$digest();
    expect(element.hasClass("collapse-horizontal")).toBe(true);
  });

  it("honors the explicit state passed to toggle", () => {
    const scope = $rootScope.$new() as IRootScopeService & { onChange: (collapsed: boolean) => void };
    scope.onChange = vi.fn();
    const element = $compile(
      `<div ngb-collapse="false" animation="false" ngb-collapse-change="onChange($event)"></div>`,
    )(scope);
    scope.$digest();
    const collapse = element.controller<NgbCollapse>("ngbCollapse");

    collapse.toggle(true);
    expect(element.hasClass("show")).toBe(false);
    expect(scope.onChange).toHaveBeenLastCalledWith(true);
    collapse.toggle(false);
    expect(element.hasClass("show")).toBe(true);
    expect(scope.onChange).toHaveBeenLastCalledWith(false);
  });
});
