import type { IRootScopeService } from "angular";
import { Injector } from "ngjs-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configureTestBed, type NgbTestBed } from "../../test/testbed";
import { NgbModule } from "../ngb.module";
import type { NgbCollapse } from "./ngb-collapse.directive";
import { NgbCollapseConfig } from "./ngb-collapse-config.service";

describe("ngbCollapse", () => {
  let tb: NgbTestBed;
  let $compile: NgbTestBed["$compile"];
  let $rootScope: IRootScopeService;
  let config: NgbCollapseConfig;

  beforeEach(async () => {
    tb = await configureTestBed(NgbModule);
    $compile = tb.$compile;
    $rootScope = tb.$rootScope;
    config = tb.get<Injector>(Injector.$name).get(NgbCollapseConfig);
  });

  afterEach(() => tb.destroy());

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

  it("honors the explicit open state passed to toggle", () => {
    const scope = $rootScope.$new() as IRootScopeService & { onChange: (collapsed: boolean) => void };
    scope.onChange = vi.fn();
    const element = $compile(
      `<div ngb-collapse="true" animation="false" ngb-collapse-change="onChange($event)"></div>`,
    )(scope);
    scope.$digest();
    const collapse = element.controller<NgbCollapse>("ngbCollapse");

    // `toggle(open)` → `collapsed = !open`; `ngbCollapseChange` emite el estado *collapsed*.
    collapse.toggle(true); // abrir
    expect(element.hasClass("show")).toBe(true);
    expect(scope.onChange).toHaveBeenLastCalledWith(false);
    collapse.toggle(false); // cerrar
    expect(element.hasClass("show")).toBe(false);
    expect(scope.onChange).toHaveBeenLastCalledWith(true);
  });
});
