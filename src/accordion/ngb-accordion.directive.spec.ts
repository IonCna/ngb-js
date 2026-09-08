import type { ICompileService, IRootScopeService } from "angular";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configureTestBed, type NgbTestBed } from "../../test/testbed";
import { NgbModule } from "../ngb.module";
import type { NgbAccordionDirective } from "./ngb-accordion.directive";

/** Port de `accordion.directive.spec.ts` de ng-bootstrap al harness de ngb-js. */
describe("ngbAccordion", () => {
  let tb: NgbTestBed;
  let $compile: ICompileService;
  let $rootScope: IRootScopeService;

  beforeEach(async () => {
    tb = await configureTestBed(NgbModule);
    $compile = tb.$compile;
    $rootScope = tb.$rootScope;
    tb.get<{ animation: boolean }>("ngb.config.service").animation = false;
  });

  afterEach(() => tb.destroy());

  type TestScope = IRootScopeService & {
    onShow: (id: string) => void;
    onShown: (id: string) => void;
    onHide: (id: string) => void;
    onHidden: (id: string) => void;
  };

  function createAccordion(attributes = "", itemAttributes = "") {
    const scope = $rootScope.$new() as TestScope;
    scope.onShow = vi.fn();
    scope.onShown = vi.fn();
    scope.onHide = vi.fn();
    scope.onHidden = vi.fn();
    const element = $compile(`
      <div ngb-accordion animation="false" ${attributes}
           show="onShow($event)" shown="onShown($event)"
           hide="onHide($event)" hidden="onHidden($event)">
        <div ngb-accordion-item="'first'" ${itemAttributes}>
          <h2 ngb-accordion-header><button ngb-accordion-button>First</button></h2>
          <div ngb-accordion-collapse><div ngb-accordion-body><ng-template>First body</ng-template></div></div>
        </div>
        <div ngb-accordion-item="'second'">
          <h2 ngb-accordion-header><button ngb-accordion-button>Second</button></h2>
          <div ngb-accordion-collapse><div ngb-accordion-body><ng-template>Second body</ng-template></div></div>
        </div>
        <div ngb-accordion-item="'third'">
          <h2 ngb-accordion-header><button ngb-accordion-button>Third</button></h2>
          <div ngb-accordion-collapse><div ngb-accordion-body><ng-template>Third body</ng-template></div></div>
        </div>
      </div>
    `)(scope);
    tb.detectChanges();
    return {
      accordion: element.controller<NgbAccordionDirective>("ngbAccordion") as NgbAccordionDirective,
      element,
      scope,
      host: element[0] as HTMLElement,
    };
  }

  const buttons = (host: HTMLElement) => Array.from(host.querySelectorAll<HTMLButtonElement>("button[ngb-accordion-button]"));
  const collapses = (host: HTMLElement) => Array.from(host.querySelectorAll<HTMLElement>(".accordion-collapse"));
  const headers = (host: HTMLElement) => Array.from(host.querySelectorAll<HTMLElement>("[ngb-accordion-header]"));
  const openState = (host: HTMLElement) => collapses(host).map((c) => c.classList.contains("show"));
  const bodyText = (host: HTMLElement, index: number) => collapses(host)[index]?.textContent?.trim() ?? "";

  it("starts with default config values and no open panels", () => {
    const { accordion, host } = createAccordion();
    // defaults de `NgbAccordionConfig`
    expect(accordion.closeOthers).toBe(false);
    expect(accordion.destroyOnHide).toBe(true);
    expect(openState(host)).toEqual([false, false, false]);
  });

  it("has the accordion css class on the host", () => {
    const { host } = createAccordion();
    expect(host.classList.contains("accordion")).toBe(true);
  });

  it("wires each collapse with aria-labelledby and the collapse class", () => {
    const { host } = createAccordion();
    collapses(host).forEach((collapse, idx) => {
      expect(collapse.getAttribute("aria-labelledby")).toBe(buttons(host)[idx].id);
      expect(collapse.classList.contains("accordion-collapse")).toBe(true);
    });
  });

  it("toggles panels independently when closeOthers is off", () => {
    const { host } = createAccordion();

    buttons(host)[1].click();
    tb.detectChanges();
    expect(openState(host)).toEqual([false, true, false]);

    buttons(host)[0].click();
    tb.detectChanges();
    expect(openState(host)).toEqual([true, true, false]);

    buttons(host)[1].click();
    tb.detectChanges();
    expect(openState(host)).toEqual([true, false, false]);
  });

  it("keeps only one panel open with closeOthers", () => {
    const { host } = createAccordion(`close-others="true"`);

    buttons(host)[0].click();
    tb.detectChanges();
    expect(openState(host)).toEqual([true, false, false]);

    buttons(host)[1].click();
    tb.detectChanges();
    expect(openState(host)).toEqual([false, true, false]);
  });

  it("renders the panel headers", () => {
    const { host } = createAccordion();
    expect(buttons(host).map((b) => b.textContent?.trim())).toEqual(["First", "Second", "Third"]);
  });

  it("gives headers and collapses their aria roles", () => {
    const { host } = createAccordion();
    headers(host).forEach((header) => expect(header.getAttribute("role")).toBe("heading"));
    collapses(host).forEach((collapse) => expect(collapse.getAttribute("role")).toBe("region"));
  });

  it("does not crash for an empty accordion", () => {
    const el = $compile(`<div ngb-accordion animation="false"></div>`)($rootScope.$new());
    tb.detectChanges();
    expect(el[0].querySelectorAll(".accordion-collapse").length).toBe(0);
  });

  it("removes hidden body content by default, keeps it with destroyOnHide=false", () => {
    const destroyed = createAccordion();
    expect(bodyText(destroyed.host, 0)).toBe("");
    expect(destroyed.host.textContent).not.toContain("First body");

    const preserved = createAccordion(`destroy-on-hide="false"`);
    expect(preserved.host.textContent).toContain("First body");
  });

  it("shows body content of an expanded panel", () => {
    const { accordion, host } = createAccordion();
    accordion.expand("first");
    tb.detectChanges();
    expect(bodyText(host, 0)).toContain("First body");
  });

  it("does not toggle disabled items on user click, marks the button disabled", () => {
    const { accordion, host } = createAccordion("", `disabled="true"`);
    const first = buttons(host)[0];
    first.click();
    tb.detectChanges();
    expect(accordion.isExpanded("first")).toBe(false);
    expect(first.disabled).toBe(true);
  });

  it("still expands a disabled item through the imperative API", () => {
    const { accordion } = createAccordion("", `disabled="true"`);
    accordion.expand("first");
    tb.detectChanges();
    expect(accordion.isExpanded("first")).toBe(true);
  });

  it("toggles the .collapsed class on the header", () => {
    const { host } = createAccordion();
    const header = headers(host)[0];
    expect(header.classList.contains("collapsed")).toBe(true);

    buttons(host)[0].click();
    tb.detectChanges();
    expect(header.classList.contains("collapsed")).toBe(false);
  });

  it("emits container and item events with the item id", () => {
    const { accordion, scope } = createAccordion();

    accordion.expand("second");
    tb.detectChanges();
    expect(scope.onShow).toHaveBeenCalledWith("second");
    expect(scope.onShown).toHaveBeenCalledWith("second");

    accordion.collapse("second");
    tb.detectChanges();
    expect(scope.onHide).toHaveBeenCalledWith("second");
    expect(scope.onHidden).toHaveBeenCalledWith("second");
  });

  describe("imperative API", () => {
    it("does not fail for unknown ids or an empty accordion", () => {
      const el = $compile(`<div ngb-accordion animation="false"></div>`)($rootScope.$new());
      tb.detectChanges();
      const accordion = el.controller<NgbAccordionDirective>("ngbAccordion") as NgbAccordionDirective;
      expect(() => {
        accordion.toggle("missing");
        accordion.expand("missing");
        accordion.collapse("missing");
        accordion.expandAll();
        accordion.collapseAll();
      }).not.toThrow();
      expect(accordion.isExpanded("missing")).toBe(false);
    });

    it("reports whether a panel is expanded", () => {
      const { accordion } = createAccordion();
      expect(accordion.isExpanded("first")).toBe(false);
      accordion.expand("first");
      tb.detectChanges();
      expect(accordion.isExpanded("first")).toBe(true);
      accordion.collapse("first");
      tb.detectChanges();
      expect(accordion.isExpanded("first")).toBe(false);
    });

    it("is a no-op when expanding an already expanded panel (or collapsing a collapsed one)", () => {
      const { accordion, scope } = createAccordion();
      accordion.expand("first");
      tb.detectChanges();
      (scope.onShow as ReturnType<typeof vi.fn>).mockClear();
      accordion.expand("first");
      tb.detectChanges();
      expect(scope.onShow).not.toHaveBeenCalled();
    });

    it("closes the other open panel when closeOthers is true", () => {
      const { accordion } = createAccordion(`close-others="true"`);
      accordion.expand("first");
      tb.detectChanges();
      accordion.expand("second");
      tb.detectChanges();
      expect(accordion.isExpanded("first")).toBe(false);
      expect(accordion.isExpanded("second")).toBe(true);
    });

    it("expandAll expands every panel when closeOthers is false", () => {
      const { accordion } = createAccordion();
      accordion.expandAll();
      tb.detectChanges();
      expect(["first", "second", "third"].every((id) => accordion.isExpanded(id))).toBe(true);
    });

    it("expandAll only opens the first panel when closeOthers is true and none is open", () => {
      const { accordion } = createAccordion(`close-others="true"`);
      accordion.expandAll();
      tb.detectChanges();
      expect(accordion.isExpanded("first")).toBe(true);
      expect(accordion.isExpanded("second")).toBe(false);
      expect(accordion.isExpanded("third")).toBe(false);
    });

    it("collapseAll closes every panel", () => {
      const { accordion } = createAccordion();
      accordion.expandAll();
      tb.detectChanges();
      accordion.collapseAll();
      tb.detectChanges();
      expect(["first", "second", "third"].some((id) => accordion.isExpanded(id))).toBe(false);
    });
  });
});
