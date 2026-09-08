import { NgbAlertConfig } from "@ngb/alert/ngb-alert-config.service";
import type { IRootScopeService } from "angular";
import angular from "angular";
import { Injector } from "ngjs-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configureTestBed, type NgbTestBed } from "../../test/testbed";
import { NgbModule } from "../ngb.module";
import type { NgbAlert } from "./ngb-alert.component";

/** Port de `alert.spec.ts` de ng-bootstrap al harness de ngb-js. */
describe("ngbAlert", () => {
  let tb: NgbTestBed;
  let $rootScope: IRootScopeService;

  beforeEach(async () => {
    tb = await configureTestBed(NgbModule);
    $rootScope = tb.$rootScope;
  });

  afterEach(() => tb.destroy());

  const config = () => tb.get<Injector>(Injector.$name).get(NgbAlertConfig);

  function create(html: string, scopeExtras: Record<string, unknown> = {}) {
    const scope = Object.assign($rootScope.$new(), scopeExtras) as IRootScopeService & Record<string, unknown>;
    const element = tb.$compile(html)(scope);
    tb.detectChanges();
    return { element, host: element[0] as HTMLElement, scope };
  }

  it("initializes inputs with default config values", () => {
    const { element } = create(`<ngb-alert>Cool!</ngb-alert>`);
    const alert = element.controller<NgbAlert>("ngbAlert") as NgbAlert & { dismissible: boolean; type: string };
    expect(alert.dismissible).toBe(config().dismissible);
    expect(alert.type).toBe(config().type);
  });

  it("applies the default values to the host", () => {
    const { host } = create(`<ngb-alert animation="false">Cool!</ngb-alert>`);
    expect(host.getAttribute("role")).toBe("alert");
    expect(host.classList.contains("alert-warning")).toBe(true);
    expect(host.classList.contains("alert-dismissible")).toBe(true);
    expect(host.classList.contains("show")).toBe(true);
    expect(host.classList.contains("fade")).toBe(false);
  });

  it("allows specifying the alert type and keeps custom classes", () => {
    const { host } = create(`<ngb-alert type="'success'" class="class1 class2" animation="false">Cool!</ngb-alert>`);
    expect(host.getAttribute("role")).toBe("alert");
    expect(host.classList.contains("alert")).toBe(true);
    expect(host.classList.contains("class1")).toBe(true);
    expect(host.classList.contains("class2")).toBe(true);
    expect(host.classList.contains("alert-success")).toBe(true);
  });

  it("reacts to a change of alert type", () => {
    const { host, scope } = create(`<ngb-alert type="type" class="class1" animation="false">Cool!</ngb-alert>`, {
      type: "success",
    });
    expect(host.classList.contains("alert-success")).toBe(true);

    scope.type = "warning";
    tb.detectChanges();
    scope.$digest();
    expect(host.classList.contains("alert-success")).toBe(false);
    expect(host.classList.contains("class1")).toBe(true);
    expect(host.classList.contains("alert-warning")).toBe(true);
  });

  it("renders the close button when dismissible", () => {
    const { host } = create(`<ngb-alert dismissible="true">Watch out!</ngb-alert>`);
    const button = host.querySelector("button.btn-close") as HTMLButtonElement;
    expect(host.classList.contains("alert-dismissible")).toBe(true);
    expect(button).toBeTruthy();
    expect(button.getAttribute("aria-label")).toBe("Close");
  });

  it("does not render the close button when not dismissible", () => {
    const { host } = create(`<ngb-alert dismissible="false">Don't close!</ngb-alert>`);
    expect(host.classList.contains("alert-dismissible")).toBe(false);
    expect(host.querySelector("button.btn-close")).toBeNull();
  });

  it("fires the closed event when the dismiss button is clicked", () => {
    const onClosed = vi.fn();
    const { host } = create(`<ngb-alert dismissible="true" animation="false" closed="onClosed()">Watch out!</ngb-alert>`, {
      onClosed,
    });
    angular.element(host.querySelector("button.btn-close") as Element).triggerHandler("click");
    tb.detectChanges();
    $rootScope.$digest();
    expect(host.classList.contains("show")).toBe(false);
    expect(onClosed).toHaveBeenCalledTimes(1);
  });

  it("fires the closed event when close() is called imperatively", () => {
    const onClosed = vi.fn();
    const { element, host } = create(`<ngb-alert dismissible="true" animation="false" closed="onClosed()">Alert</ngb-alert>`, {
      onClosed,
    });
    const alert = element.controller<NgbAlert>("ngbAlert") as NgbAlert;
    const completed = vi.fn();
    alert.close().subscribe({ complete: completed });
    tb.detectChanges();
    $rootScope.$digest();
    expect(onClosed).toHaveBeenCalledTimes(1);
    expect(completed).toHaveBeenCalledTimes(1);
    expect(host.classList.contains("show")).toBe(false);
  });

  it("projects the content into the component", () => {
    const { host } = create(`<ngb-alert animation="false">Cool!</ngb-alert>`);
    expect(host.textContent).toContain("Cool!");
  });

  it("projects content before the close button for screen readers", () => {
    const { host } = create(`<ngb-alert dismissible="true" animation="false"><span>Cool!</span></ngb-alert>`);
    const tags = Array.from(host.children).map((n) => n.tagName.toLowerCase());
    expect(tags).toEqual(["span", "button"]);
  });

  describe("custom config", () => {
    beforeEach(() => {
      const c = config();
      c.dismissible = false;
      c.type = "success";
    });

    it("initializes inputs from the mutated config", () => {
      const { element } = create(`<ngb-alert>Cool!</ngb-alert>`);
      const alert = element.controller<NgbAlert>("ngbAlert") as NgbAlert & { dismissible: boolean; type: string };
      expect(alert.dismissible).toBe(false);
      expect(alert.type).toBe("success");
    });
  });
});
