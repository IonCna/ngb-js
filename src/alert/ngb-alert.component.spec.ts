import type { ICompileService, IRootScopeService } from "angular";
import angular from "angular";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NgbModule } from "../ngb.module";
import type { NgbAlert } from "./ngb-alert.component";

describe("ngbAlert", () => {
  let $compile: ICompileService;
  let $rootScope: IRootScopeService;

  beforeEach(() => {
    angular.mock.module(NgbModule.name);
    angular.mock.inject((_$compile_: ICompileService, _$rootScope_: IRootScopeService) => {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    });
  });

  it("renders bootstrap classes and closes when dismiss button is clicked", () => {
    const scope = $rootScope.$new() as IRootScopeService & {
      onClosed: () => void;
    };
    const onClosed = vi.fn();
    scope.onClosed = onClosed;

    const element = $compile(`
            <ngb-alert dismissible="true" animation="false" type="'success'" closed="onClosed()">
                Alert text
            </ngb-alert>
        `)(scope);
    scope.$digest();

    const alert = element;
    expect(alert.length).toBe(1);

    expect(alert.hasClass("show")).toBe(true);
    expect(alert.hasClass("alert-success")).toBe(true);
    expect(alert.hasClass("alert-dismissible")).toBe(true);
    expect(alert.attr("role")).toBe("alert");

    const button = angular.element((element[0] as HTMLElement).querySelector(".btn-close") as Element);
    expect(button.length).toBe(1);
    button.triggerHandler("click");
    scope.$digest();

    expect(element.hasClass("show")).toBe(false);
    expect(onClosed).toHaveBeenCalledTimes(1);
  });

  it("uses default type, dismissibility and animation classes", () => {
    const element = $compile(`<ngb-alert>Default alert</ngb-alert>`)($rootScope.$new());
    $rootScope.$digest();

    expect(element.hasClass("alert-warning")).toBe(true);
    expect(element.hasClass("alert-dismissible")).toBe(true);
    expect(element.hasClass("fade")).toBe(true);
    expect(element[0].querySelector(".btn-close")).not.toBeNull();
  });

  it("does not render a close button when dismissible is false", () => {
    const element = $compile(`<ngb-alert dismissible="false">Alert</ngb-alert>`)($rootScope.$new());
    $rootScope.$digest();
    expect(element.hasClass("alert-dismissible")).toBe(false);
    expect(element[0].querySelector(".btn-close")).toBeNull();
  });

  it("reacts to changes of type and dismissibility", () => {
    const scope = $rootScope.$new() as IRootScopeService & { dismissible: boolean; type: string };
    scope.dismissible = false;
    scope.type = "info";
    const element = $compile(`<ngb-alert type="type" dismissible="dismissible">Alert</ngb-alert>`)(scope);
    scope.$digest();
    expect(element.hasClass("alert-info")).toBe(true);

    scope.type = "danger";
    scope.dismissible = true;
    scope.$digest();
    expect(element.hasClass("alert-info")).toBe(false);
    expect(element.hasClass("alert-danger")).toBe(true);
    expect(element[0].querySelector(".btn-close")).not.toBeNull();
  });

  it("preserves custom host classes", () => {
    const element = $compile(`<ngb-alert class="custom-alert" animation="false">Alert</ngb-alert>`)($rootScope.$new());
    $rootScope.$digest();
    expect(element.hasClass("custom-alert")).toBe(true);
    expect(element.hasClass("alert-warning")).toBe(true);
  });

  it("projects content before the close button", () => {
    const element = $compile(`<ngb-alert animation="false"><span class="message">Message</span></ngb-alert>`)(
      $rootScope.$new(),
    );
    $rootScope.$digest();
    const message = element[0].querySelector(".message");
    const button = element[0].querySelector(".btn-close");
    expect(message?.compareDocumentPosition?.(button as Node) as any & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("closes imperatively and emits closed once", () => {
    const scope = $rootScope.$new() as IRootScopeService & { onClosed: () => void };
    scope.onClosed = vi.fn();
    const element = $compile(`<ngb-alert animation="false" closed="onClosed()">Alert</ngb-alert>`)(scope);
    scope.$digest();

    const alert = element.controller<NgbAlert>("ngbAlert");
    const completed = vi.fn();
    alert.close().subscribe({ complete: completed });
    scope.$digest();

    expect(element.hasClass("show")).toBe(false);
    expect(scope.onClosed).toHaveBeenCalledOnce();
    expect(completed).toHaveBeenCalledOnce();
  });
});
