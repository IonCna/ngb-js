import { NgbOffcanvas } from "@ngb/offcanvas/ngb-offcanvas.service";
import { OffcanvasDismissReasons } from "@ngb/offcanvas/ngb-offcanvas-dismiss-reasons";
import type { NgbActiveOffcanvas, NgbOffcanvasRef } from "@ngb/offcanvas/ngb-offcanvas-ref";
import type { IRootScopeService } from "angular";
import angular from "angular";
import { Component, Injector, Input, NgModule, type TemplateRef } from "ngjs-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configureTestBed, type NgbTestBed } from "../../test/testbed";
import { NgbModule } from "../ngb.module";

@Component({
  selector: "ngb-offcanvas-spec-content",
  controllerAs: "$",
  template: `
    <div class="offcanvas-spec-content">{{ $.value }}</div>
    <button class="offcanvas-spec-close" ng-click="$.ngbActiveOffcanvas.close('component result')">Close</button>
  `,
})
class NgbOffcanvasSpecContent {
  @Input() value?: string;
  @Input() ngbActiveOffcanvas!: NgbActiveOffcanvas;

  static get $name() {
    return "ngbOffcanvasSpecContent";
  }
}

@NgModule({ id: "ngb.offcanvas.spec", imports: [NgbModule], declarations: [NgbOffcanvasSpecContent] })
class NgbOffcanvasSpecModule {}

describe("NgbOffcanvas", () => {
  let tb: NgbTestBed;
  let $compile: NgbTestBed["$compile"];
  let $rootScope: IRootScopeService;
  let ngbOffcanvas: NgbOffcanvas;

  beforeEach(async () => {
    tb = await configureTestBed(NgbOffcanvasSpecModule);
    $compile = tb.$compile;
    $rootScope = tb.$rootScope;
    ngbOffcanvas = tb.get<Injector>(Injector.$name).get(NgbOffcanvas);
  });

  afterEach(async () => {
    ngbOffcanvas?.dismiss("test cleanup");
    await flush();
    tb.destroy();
    document.body.innerHTML = "";
    document.body.style.overflow = "";
  });

  async function flush(): Promise<void> {
    for (let index = 0; index < 60; index++) {
      tb.detectChanges();
      $rootScope.$digest();
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
  }

  async function resolveOpen<T>(promise: PromiseLike<T>): Promise<T> {
    let resolved: T | undefined;
    let rejected: unknown;
    promise.then(
      (value) => {
        resolved = value;
      },
      (reason) => {
        rejected = reason;
      },
    );
    await flush();
    if (rejected !== undefined) throw rejected;
    if (resolved === undefined) throw new Error("Offcanvas did not finish opening");
    return resolved;
  }

  it("opens component content with bindings and resolves on close", async () => {
    const offcanvasRef = await resolveOpen(
      ngbOffcanvas.open(NgbOffcanvasSpecContent.$name, {
        animation: false,
        bindings: { value: "Bound offcanvas value" },
        panelClass: "offcanvas-spec-panel",
        position: "end",
      }),
    );
    await flush();

    expect(offcanvasRef.componentInstance).toBeInstanceOf(NgbOffcanvasSpecContent);
    expect((offcanvasRef.componentInstance as NgbOffcanvasSpecContent).value).toBe("Bound offcanvas value");
    expect(document.body.querySelector(".offcanvas-spec-content")?.textContent).toContain("Bound offcanvas value");
    expect(document.body.querySelector("ngb-offcanvas-panel")?.classList.contains("offcanvas-end")).toBe(true);
    expect(document.body.querySelector("ngb-offcanvas-panel")?.classList.contains("offcanvas-spec-panel")).toBe(true);
    expect(document.body.style.overflow).toBe("hidden");

    const closed = vi.fn();
    offcanvasRef.closed.subscribe(closed);
    angular.element(document.body.querySelector(".offcanvas-spec-close") as Element).triggerHandler("click");
    await flush();

    expect(closed).toHaveBeenCalledWith("component result");
    if (!offcanvasRef.result) throw new Error("Offcanvas result promise is missing");
    expect(await resolveOpen(offcanvasRef.result)).toBe("component result");
    expect(document.body.querySelector("ngb-offcanvas-panel")).toBeNull();
    expect(document.body.querySelector("ngb-offcanvas-backdrop")).toBeNull();
    expect(document.body.style.overflow).toBe("");
  });

  it("renders TemplateRef context and dismisses from the embedded view", async () => {
    const scope = $rootScope.$new() as IRootScopeService & {
      message: string;
      offcanvasTemplate?: TemplateRef<unknown>;
    };
    scope.message = "Template offcanvas value";
    const host = $compile(`
      <div>
        <ng-template ng-ref="offcanvasTemplate" let-close="close" let-dismiss="dismiss">
          <div class="template-offcanvas">{{ message }}</div>
          <button class="template-offcanvas-close" ng-click="close('template result')">Close template</button>
          <button class="template-offcanvas-dismiss" ng-click="dismiss('template reason')">Dismiss template</button>
        </ng-template>
      </div>
    `)(scope);
    angular.element(document.body).append(host);
    scope.$digest();

    const offcanvasRef = await resolveOpen(ngbOffcanvas.open(scope.offcanvasTemplate, { animation: false }));
    await flush();
    expect(document.body.querySelector(".template-offcanvas")?.textContent).toContain("Template offcanvas value");

    const dismissed = vi.fn();
    offcanvasRef.dismissed.subscribe(dismissed);
    angular.element(document.body.querySelector(".template-offcanvas-dismiss") as Element).triggerHandler("click");
    await flush();

    expect(dismissed).toHaveBeenCalledWith("template reason");
    expect(document.body.querySelector(".template-offcanvas")).toBeNull();
    host.remove();
  });

  it("honors beforeDismiss before removing the panel", async () => {
    let allowDismiss = false;
    const offcanvasRef: NgbOffcanvasRef = await resolveOpen(
      ngbOffcanvas.open(NgbOffcanvasSpecContent.$name, {
        animation: false,
        beforeDismiss: () => allowDismiss,
      }),
    );
    const dismissed = vi.fn();
    offcanvasRef.dismissed.subscribe(dismissed);

    offcanvasRef.dismiss("blocked");
    await flush();
    expect(dismissed).not.toHaveBeenCalled();
    expect(ngbOffcanvas.hasOpenOffcanvas()).toBe(true);

    allowDismiss = true;
    offcanvasRef.dismiss("accepted");
    await flush();
    expect(dismissed).toHaveBeenCalledWith("accepted");
    expect(ngbOffcanvas.hasOpenOffcanvas()).toBe(false);
  });

  it("dismisses with the Angular-compatible reason when the backdrop is pressed", async () => {
    const offcanvasRef = await resolveOpen(
      ngbOffcanvas.open(NgbOffcanvasSpecContent.$name, { animation: false, backdrop: true }),
    );
    const dismissed = vi.fn();
    offcanvasRef.dismissed.subscribe(dismissed);

    // El backdrop escucha con `addEventListener` (RxJS `fromEvent`): `triggerHandler`
    // de jqLite no lo alcanza, hay que despachar un evento real.
    (document.body.querySelector("ngb-offcanvas-backdrop") as HTMLElement).dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true }),
    );
    await flush();

    expect(dismissed).toHaveBeenCalledWith(OffcanvasDismissReasons.BACKDROP_CLICK);
  });

  it("renders default panel, backdrop and accessibility semantics", async () => {
    await resolveOpen(ngbOffcanvas.open(NgbOffcanvasSpecContent.$name, { animation: false }));
    const panel = document.body.querySelector("ngb-offcanvas-panel");
    const backdrop = document.body.querySelector("ngb-offcanvas-backdrop");
    expect(panel?.classList.contains("offcanvas")).toBe(true);
    expect(panel?.classList.contains("offcanvas-start")).toBe(true);
    expect(panel?.getAttribute("role")).toBe("dialog");
    expect(panel?.getAttribute("aria-modal")).toBe("true");
    expect(panel?.getAttribute("tabindex")).toBe("-1");
    expect(backdrop?.classList.contains("offcanvas-backdrop")).toBe(true);
  });

  it("supports no backdrop and static backdrop", async () => {
    const withoutBackdrop = await resolveOpen(
      ngbOffcanvas.open(NgbOffcanvasSpecContent.$name, { animation: false, backdrop: false }),
    );
    expect(document.body.querySelector("ngb-offcanvas-backdrop")).toBeNull();
    withoutBackdrop.close();
    await flush();

    await resolveOpen(ngbOffcanvas.open(NgbOffcanvasSpecContent.$name, { animation: false, backdrop: "static" }));
    angular.element(document.body.querySelector("ngb-offcanvas-backdrop") as Element).triggerHandler("mousedown");
    await flush();
    expect(ngbOffcanvas.hasOpenOffcanvas()).toBe(true);
  });

  it("applies position, panel, backdrop and aria options", async () => {
    await resolveOpen(
      ngbOffcanvas.open(NgbOffcanvasSpecContent.$name, {
        animation: false,
        ariaDescribedBy: "offcanvas-description",
        ariaLabelledBy: "offcanvas-title",
        backdropClass: "custom-backdrop",
        panelClass: "custom-panel another-panel-class",
        position: "top",
      }),
    );
    const panel = document.body.querySelector("ngb-offcanvas-panel");
    expect(panel?.classList.contains("offcanvas-top")).toBe(true);
    expect(panel?.classList.contains("custom-panel")).toBe(true);
    expect(panel?.classList.contains("another-panel-class")).toBe(true);
    expect(panel?.getAttribute("aria-labelledby")).toBe("offcanvas-title");
    expect(panel?.getAttribute("aria-describedby")).toBe("offcanvas-description");
    expect(document.body.querySelector("ngb-offcanvas-backdrop")?.classList.contains("custom-backdrop")).toBe(true);
  });

  it("attaches panel and backdrop to selector and jqLite containers", async () => {
    const selectorContainer = document.createElement("section");
    selectorContainer.id = "offcanvas-container";
    document.body.appendChild(selectorContainer);
    const first = await resolveOpen(
      ngbOffcanvas.open(NgbOffcanvasSpecContent.$name, {
        animation: false,
        container: "#offcanvas-container",
      }),
    );
    expect(selectorContainer.querySelector("ngb-offcanvas-panel")).not.toBeNull();
    expect(selectorContainer.querySelector("ngb-offcanvas-backdrop")).not.toBeNull();
    first.close();
    await flush();

    const elementContainer = document.createElement("section");
    document.body.appendChild(elementContainer);
    await resolveOpen(
      ngbOffcanvas.open(NgbOffcanvasSpecContent.$name, {
        animation: false,
        container: angular.element(elementContainer),
      }),
    );
    expect(elementContainer.querySelector("ngb-offcanvas-panel")).not.toBeNull();
  });

  it("throws for a missing container", () => {
    expect(() =>
      ngbOffcanvas.open(NgbOffcanvasSpecContent.$name, { container: "#missing-offcanvas-container" }),
    ).toThrow("was not found in the DOM");
  });

  it("tracks the active instance and dismisses it through the service", async () => {
    const active = vi.fn();
    ngbOffcanvas.activeInstance.subscribe(active);
    const ref = await resolveOpen(ngbOffcanvas.open(NgbOffcanvasSpecContent.$name, { animation: false }));
    expect(ngbOffcanvas.hasOpenOffcanvas()).toBe(true);
    expect(active).toHaveBeenLastCalledWith(ref);
    const dismissed = vi.fn();
    ref.dismissed.subscribe(dismissed);
    ngbOffcanvas.dismiss("service reason");
    await flush();
    expect(dismissed).toHaveBeenCalledWith("service reason");
    expect(ngbOffcanvas.hasOpenOffcanvas()).toBe(false);
    expect(active).toHaveBeenLastCalledWith(undefined);
    expect(() => ngbOffcanvas.dismiss()).not.toThrow();
  });

  it("ignores repeated close and dismiss calls", async () => {
    const closing = await resolveOpen(ngbOffcanvas.open(NgbOffcanvasSpecContent.$name, { animation: false }));
    expect(() => {
      closing.close("first");
      closing.close("second");
      closing.dismiss("late");
    }).not.toThrow();
    await flush();

    const dismissing = await resolveOpen(ngbOffcanvas.open(NgbOffcanvasSpecContent.$name, { animation: false }));
    expect(() => {
      dismissing.dismiss("first");
      dismissing.dismiss("second");
      dismissing.close("late");
    }).not.toThrow();
  });

  it("honors asynchronous beforeDismiss outcomes", async () => {
    const blocked = await resolveOpen(
      ngbOffcanvas.open(NgbOffcanvasSpecContent.$name, {
        animation: false,
        beforeDismiss: () => Promise.resolve(false),
      }),
    );
    blocked.dismiss("blocked");
    await flush();
    expect(ngbOffcanvas.hasOpenOffcanvas()).toBe(true);
    blocked.close();
    await flush();

    const accepted = await resolveOpen(
      ngbOffcanvas.open(NgbOffcanvasSpecContent.$name, {
        animation: false,
        beforeDismiss: () => Promise.resolve(true),
      }),
    );
    const dismissed = vi.fn();
    accepted.dismissed.subscribe(dismissed);
    accepted.dismiss("accepted");
    await flush();
    expect(dismissed).toHaveBeenCalledWith("accepted");
  });

  it("dismisses on Escape only when keyboard handling is enabled", async () => {
    const animationFrame = vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });
    const enabled = await resolveOpen(
      ngbOffcanvas.open(NgbOffcanvasSpecContent.$name, { animation: false, keyboard: true }),
    );
    const dismissed = vi.fn();
    enabled.dismissed.subscribe(dismissed);
    document.body
      .querySelector("ngb-offcanvas-panel")
      ?.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Escape" }));
    await flush();
    expect(dismissed).toHaveBeenCalledWith(OffcanvasDismissReasons.ESC);

    await resolveOpen(ngbOffcanvas.open(NgbOffcanvasSpecContent.$name, { animation: false, keyboard: false }));
    document.body
      .querySelector("ngb-offcanvas-panel")
      ?.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Escape" }));
    await flush();
    expect(ngbOffcanvas.hasOpenOffcanvas()).toBe(true);
    animationFrame.mockRestore();
  });

  it("keeps document scrolling enabled when scroll is true", async () => {
    await resolveOpen(ngbOffcanvas.open(NgbOffcanvasSpecContent.$name, { animation: false, scroll: true }));
    expect(document.body.style.overflow).not.toBe("hidden");
  });

  it("moves focus into the panel and restores the previously focused element", async () => {
    const opener = document.createElement("button");
    document.body.appendChild(opener);
    opener.focus();
    const ref = await resolveOpen(ngbOffcanvas.open(NgbOffcanvasSpecContent.$name, { animation: false }));
    await flush();
    expect(document.body.querySelector("ngb-offcanvas-panel")?.contains(document.activeElement)).toBe(true);
    ref.close();
    await flush();
    expect(document.activeElement).toBe(opener);
  });
});
