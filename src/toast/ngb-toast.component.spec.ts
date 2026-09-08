import type { ICompileService, IRootScopeService } from "angular";
import angular from "angular";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configureTestBed, type NgbTestBed } from "../../test/testbed";
import { NgbModule } from "../ngb.module";

describe("ngbToast", () => {
  let tb: NgbTestBed;
  let $compile: ICompileService;
  let $rootScope: IRootScopeService;

  beforeEach(async () => {
    tb = await configureTestBed(NgbModule);
    $compile = tb.$compile;
    $rootScope = tb.$rootScope;
  });

  afterEach(() => {
    vi.useRealTimers();
    tb.destroy();
  });

  it("sets bootstrap toast semantics on host element", () => {
    const scope = $rootScope.$new();
    const element = $compile(`<ngb-toast>Toast message</ngb-toast>`)(scope);
    tb.detectChanges();

    expect(element.attr("role")).toBe("alert");
    expect(element.attr("aria-atomic")).toBe("true");
    expect(element.hasClass("toast")).toBe(true);
    expect(element.hasClass("show")).toBe(true);
  });

  it("renders transcluded toast header content", () => {
    const scope = $rootScope.$new();
    const element = $compile(`
            <ngb-toast>
                <ng-template ngb-toast-header><strong>Custom header</strong></ng-template>
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

  it("uses default classes and ARIA live semantics", () => {
    const element = $compile(`<ngb-toast animation="false">Toast</ngb-toast>`)($rootScope.$new());
    tb.detectChanges();
    expect(element.hasClass("toast")).toBe(true);
    expect(element.hasClass("show")).toBe(true);
    expect(element.attr("aria-live")).toBe("polite");
    expect(element.attr("aria-atomic")).toBe("true");
  });

  it("does not create a header without header content", () => {
    const element = $compile(`<ngb-toast>Toast</ngb-toast>`)($rootScope.$new());
    tb.detectChanges();
    expect(element[0].querySelector(".toast-header")).toBeNull();
    expect(element[0].querySelector(".btn-close")).toBeNull();
  });

  it("renders a string header and close button", () => {
    const element = $compile(`<ngb-toast header="'Notice'">Toast</ngb-toast>`)($rootScope.$new());
    tb.detectChanges();
    expect(element[0].querySelector(".toast-header")?.textContent).toContain("Notice");
    expect(element[0].querySelector(".btn-close")?.getAttribute("aria-label")).toBe("Close");
  });

  it("emits hidden once when the header close button is clicked", () => {
    const scope = $rootScope.$new() as IRootScopeService & { onHidden: () => void };
    scope.onHidden = vi.fn();
    const element = $compile(
      `<ngb-toast header="'Notice'" animation="false" autohide="false" hidden="onHidden()">Toast</ngb-toast>`,
    )(scope);
    tb.detectChanges();
    angular.element(element[0].querySelector(".btn-close") as HTMLElement).triggerHandler("click");
    tb.detectChanges();
    expect(element.hasClass("show")).toBe(false);
    expect(scope.onHidden).toHaveBeenCalledOnce();
  });

  it("autohides after a custom delay", () => {
    vi.useFakeTimers();
    const scope = $rootScope.$new() as IRootScopeService & { onHidden: () => void };
    scope.onHidden = vi.fn();
    const element = $compile(`<ngb-toast animation="false" delay="250" hidden="onHidden()">Toast</ngb-toast>`)(scope);
    tb.detectChanges();
    vi.advanceTimersByTime(249);
    expect(scope.onHidden).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    tb.detectChanges();
    expect(scope.onHidden).toHaveBeenCalledOnce();
    expect(element.hasClass("show")).toBe(false);
    vi.useRealTimers();
  });

  it("cancels autohide when autohide changes to false", () => {
    vi.useFakeTimers();
    const scope = $rootScope.$new() as IRootScopeService & { autohide: boolean; onHidden: () => void };
    scope.autohide = true;
    scope.onHidden = vi.fn();
    $compile(`<ngb-toast animation="false" delay="100" autohide="autohide" hidden="onHidden()">Toast</ngb-toast>`)(
      scope,
    );
    tb.detectChanges();
    scope.autohide = false;
    tb.detectChanges();
    vi.advanceTimersByTime(100);
    expect(scope.onHidden).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
