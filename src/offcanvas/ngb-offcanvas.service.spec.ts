import { NgbOffcanvas } from "@ngb/offcanvas/ngb-offcanvas.service";
import { OffcanvasDismissReasons } from "@ngb/offcanvas/ngb-offcanvas-dismiss-reasons";
import type { NgbActiveOffcanvas, NgbOffcanvasRef } from "@ngb/offcanvas/ngb-offcanvas-ref";
import type { ICompileService, IComponentOptions, IInjectorService, IRootScopeService } from "angular";
import angular from "angular";
import type { TemplateRef } from "ngjs-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NgbModule } from "../ngb.module";

class NgbOffcanvasSpecContent {
  value?: string;
  ngbActiveOffcanvas!: NgbActiveOffcanvas;

  static get $name() {
    return "ngbOffcanvasSpecContent";
  }

  static get $factory(): IComponentOptions {
    return {
      bindings: {
        ngbActiveOffcanvas: "<",
        value: "<",
      },
      controller: NgbOffcanvasSpecContent,
      controllerAs: "$",
      template: `
        <div class="offcanvas-spec-content">{{ $.value }}</div>
        <button class="offcanvas-spec-close" ng-click="$.ngbActiveOffcanvas.close('component result')">Close</button>
      `,
    };
  }
}

const NgbOffcanvasSpecModule = angular.module("ngb.offcanvas.spec", []);
NgbOffcanvasSpecModule.component(NgbOffcanvasSpecContent.$name, NgbOffcanvasSpecContent.$factory);

describe("NgbOffcanvas", () => {
  let $compile: ICompileService;
  let $rootScope: IRootScopeService;
  let ngbOffcanvas: NgbOffcanvas;

  beforeEach(() => {
    angular.mock.module(NgbModule.name, NgbOffcanvasSpecModule.name);
    angular.mock.inject(
      (_$compile_: ICompileService, _$rootScope_: IRootScopeService, _$injector_: IInjectorService) => {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        ngbOffcanvas = _$injector_.get<NgbOffcanvas>(NgbOffcanvas.$name);
      },
    );
  });

  afterEach(async () => {
    ngbOffcanvas?.dismiss("test cleanup");
    await flush();
    document.body.innerHTML = "";
    document.body.style.overflow = "";
  });

  async function flush(): Promise<void> {
    for (let index = 0; index < 6; index++) {
      $rootScope.$digest();
      await Promise.resolve();
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

    angular.element(document.body.querySelector("ngb-offcanvas-backdrop") as Element).triggerHandler("mousedown");
    await flush();

    expect(dismissed).toHaveBeenCalledWith(OffcanvasDismissReasons.BACKDROP_CLICK);
  });
});
