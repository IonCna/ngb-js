import type { ICompileService, IRootScopeService } from "angular";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NgbModule } from "../ngb.module";
import { configureTestBed, type NgbTestBed } from "../../test/testbed";

describe("ngbToast", () => {
  let tb: NgbTestBed;
  let $compile: ICompileService;
  let $rootScope: IRootScopeService;

  beforeEach(async () => {
    tb = await configureTestBed(NgbModule);
    $compile = tb.$compile;
    $rootScope = tb.$rootScope;
  });

  afterEach(() => tb.destroy());

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
});
