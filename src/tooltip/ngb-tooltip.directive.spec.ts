import type { ICompileService, IPromise, IRootScopeService, ITimeoutService } from "angular";
import angular from "angular";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NgbModule } from "../ngb.module";

type MockTimeoutService = ITimeoutService & {
  flush: (delay?: number) => void;
  verifyNoPendingTasks: () => void;
};

describe("ngbTooltip", () => {
  let $compile: ICompileService;
  let $rootScope: IRootScopeService;
  let $timeout: MockTimeoutService;
  let appRef: { tick: () => void };

  beforeEach(() => {
    angular.mock.module(NgbModule.name);
    angular.mock.inject(
      (
        _$compile_: ICompileService,
        _$rootScope_: IRootScopeService,
        _$timeout_: ITimeoutService,
        _$injector_: angular.auto.IInjectorService,
      ) => {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_ as MockTimeoutService;
        appRef = _$injector_.get("ApplicationRef");
      },
    );
  });

  /** `$timeout.flush()` tira si no hay tareas pendientes; acá eso no es error. */
  const flushTimeout = () => {
    try {
      $timeout.flush();
    } catch (error) {
      if (!(error as Error)?.message?.includes("No deferred tasks")) throw error;
    }
  };

  /** Vacía `afterNextRender` (la clase `.show` del popup la agrega una transición post-render). */
  const flushRender = () => appRef.tick();

  /**
   * Drena todo lo pendiente del ciclo de apertura/cierre de un popup: promesas
   * (`$q` de `createComponent`), `$timeout` de su poll, microtasks, y
   * `afterNextRender` (la transición que agrega/saca `.show`). `createComponent`
   * resuelve por `$rootScope.$digest`, no por un scope hijo.
   */
  async function drain(): Promise<void> {
    for (let i = 0; i < 15; i++) {
      $rootScope.$digest();
      flushTimeout();
      flushRender();
      await Promise.resolve();
    }
  }

  afterEach(() => {
    document.body.innerHTML = "";
  });

  async function settle(promise: IPromise<void>): Promise<void> {
    let settled = false;
    let rejected: unknown;
    promise.then(
      () => {
        settled = true;
      },
      (error) => {
        rejected = error;
      },
    );
    for (let index = 0; index < 20; index++) {
      $rootScope.$digest();
      await Promise.resolve();
    }
    if (rejected) throw rejected;
    if (!settled) throw new Error("Tooltip opening did not settle");
  }

  it("opens and closes tooltip via controller api", async () => {
    const scope = $rootScope.$new() as IRootScopeService & {
      shown: () => void;
      hidden: () => void;
    };
    scope.shown = () => void 0;
    scope.hidden = () => void 0;

    const element = $compile(`
            <button
                type="button"
                ngb-tooltip="'Tooltip text'"
                open-delay="0"
                close-delay="0"
                animation="false"
                shown="shown()"
                hidden="hidden()">
                Toggle
            </button>
        `)(scope);
    angular.element(document.body).append(element);
    scope.$digest();

    expect(document.body.querySelector(".tooltip")).toBeNull();

    const ctrl = element.controller("ngbTooltip") as {
      open: () => IPromise<void>;
      close: () => void;
    };
    const opening = ctrl.open();
    scope.$digest();
    await settle(opening);
    scope.$digest();
    flushTimeout();
    scope.$digest();

    expect((ctrl as { isOpen: () => boolean }).isOpen()).toBe(true);
    expect(document.body.querySelector(".tooltip-inner")?.textContent).toContain("Tooltip text");

    ctrl.close();
    scope.$digest();

    expect((ctrl as { isOpen: () => boolean }).isOpen()).toBe(false);
    element.remove();
  });

  it("does not open when disabled", () => {
    const scope = $rootScope.$new();
    const element = $compile(`
            <button
                type="button"
                ngb-tooltip="'Hidden tooltip'"
                triggers="'click'"
                disable-tooltip="true"
                open-delay="0"
                animation="false">
                Disabled
            </button>
        `)(scope);
    angular.element(document.body).append(element);
    scope.$digest();

    element.triggerHandler("click");
    scope.$digest();

    expect(document.body.querySelector(".tooltip")).toBeNull();
    element.remove();
  });

  it("renders a TemplateRef with the provided tooltip context", async () => {
    const scope = $rootScope.$new();
    const host = $compile(`
      <div>
        <ng-template ng-ref="tooltipTpl" let-name="name">
          <strong class="template-tooltip">Hello {{ name }}</strong>
        </ng-template>
        <button
          type="button"
          ngb-tooltip="tooltipTpl"
          tooltip-context="{ name: 'ngjs-core' }"
          animation="false">
          Open template
        </button>
      </div>
    `)(scope);
    angular.element(document.body).append(host);
    scope.$digest();

    const button = angular.element(host[0].querySelector("button") as Element);
    const tooltip = button.controller("ngbTooltip") as { open: (context?: { name: string }) => IPromise<void> };
    const opening = tooltip.open({ name: "ngjs-core" });
    scope.$digest();
    await settle(opening);
    scope.$digest();
    flushTimeout();
    scope.$digest();

    expect(document.body.querySelector(".template-tooltip")?.textContent).toContain("Hello ngjs-core");
  });

  it("reopens when hovering again during the closing transition", async () => {
    const scope = $rootScope.$new();
    const element = $compile(`
            <button
                type="button"
                ngb-tooltip="'Fast tooltip'"
                open-delay="0"
                close-delay="0">
                Fast
            </button>
        `)(scope);
    angular.element(document.body).append(element);
    scope.$digest();

    const ctrl = element.controller("ngbTooltip") as { isOpen: () => boolean };
    const button = element[0];

    button.dispatchEvent(new MouseEvent("mouseenter"));
    await Promise.resolve();
    await Promise.resolve();
    scope.$digest();
    flushTimeout();

    button.dispatchEvent(new MouseEvent("mouseleave"));
    button.dispatchEvent(new MouseEvent("mouseenter"));
    await Promise.resolve();
    await Promise.resolve();
    scope.$digest();
    flushTimeout();
    scope.$digest();

    expect(ctrl.isOpen()).toBe(true);
    expect(document.body.querySelector(".tooltip-inner")?.textContent).toContain("Fast tooltip");
    element.remove();
  });

  it("opens the next tooltip when moving quickly between hosts", async () => {
    const scope = $rootScope.$new();
    const elements = $compile(`
            <div>
                <button type="button" ngb-tooltip="'First tooltip'" open-delay="0" close-delay="0" animation="false">First</button>
                <button type="button" ngb-tooltip="'Second tooltip'" open-delay="0" close-delay="0" animation="false">Second</button>
            </div>
        `)(scope);
    angular.element(document.body).append(elements);
    scope.$digest();

    const [first, second] = Array.from(elements[0].querySelectorAll("button"));

    first.dispatchEvent(new MouseEvent("mouseenter"));
    await drain();

    first.dispatchEvent(new MouseEvent("mouseleave"));
    second.dispatchEvent(new MouseEvent("mouseenter"));
    await drain();

    const tooltipTexts = Array.from(document.body.querySelectorAll(".tooltip-inner")).map(
      (tooltip) => tooltip.textContent,
    );
    expect(tooltipTexts).toContain("Second tooltip");
    expect(document.body.querySelector(".tooltip.show .tooltip-inner")?.textContent).toContain("Second tooltip");
    elements.remove();
  });

  it("toma los inputs string como valor literal del atributo (binding: '@')", async () => {
    const scope = $rootScope.$new();
    const element = $compile(`
            <button
                type="button"
                ngb-tooltip="'Tooltip'"
                placement="top left"
                triggers="manual"
                tooltip-class="my-tip"
                open-delay="0"
                close-delay="0"
                animation="false">
                Literal
            </button>
        `)(scope);
    angular.element(document.body).append(element);
    scope.$digest();

    const ctrl = element.controller("ngbTooltip") as {
      open: () => IPromise<void>;
      isOpen: () => boolean;
      placement: unknown;
      triggers: unknown;
      tooltipClass: unknown;
    };

    // Sin comillas y con espacios: `@` los pasa crudos, no los evalúa como expresión.
    expect(ctrl.placement).toBe("top left");
    expect(ctrl.triggers).toBe("manual");
    expect(ctrl.tooltipClass).toBe("my-tip");

    const opening = ctrl.open();
    scope.$digest();
    await settle(opening);
    scope.$digest();
    flushTimeout();
    scope.$digest();

    expect(ctrl.isOpen()).toBe(true);
    element.remove();
  });

  it("does not open for empty content and closes when content becomes empty", async () => {
    const scope = $rootScope.$new() as IRootScopeService & { content: string };
    scope.content = "";
    const element = $compile(`<button ngb-tooltip="content" triggers="manual" animation="false">Host</button>`)(scope);
    angular.element(document.body).append(element);
    scope.$digest();
    const tooltip = element.controller("ngbTooltip") as { close(): void; isOpen(): boolean; open(): IPromise<void> };
    await settle(tooltip.open());
    expect(tooltip.isOpen()).toBe(false);
    scope.content = "Visible";
    scope.$digest();
    await settle(tooltip.open());
    expect(tooltip.isOpen()).toBe(true);
    scope.content = "";
    scope.$digest();
    expect(tooltip.isOpen()).toBe(false);
  });

  it("toggles manually and supports reopening", async () => {
    const element = $compile(`<button ngb-tooltip="'Tip'" triggers="manual" animation="false">Host</button>`)(
      $rootScope.$new(),
    );
    angular.element(document.body).append(element);
    $rootScope.$digest();
    const tooltip = element.controller("ngbTooltip") as { isOpen(): boolean; toggle(): void };
    tooltip.toggle();
    await drain();
    expect(tooltip.isOpen()).toBe(true);
    tooltip.toggle();
    await drain();
    expect(tooltip.isOpen()).toBe(false);
    tooltip.toggle();
    await drain();
    expect(tooltip.isOpen()).toBe(true);
  });

  it("emits shown and hidden only for actual visibility changes", async () => {
    const scope = $rootScope.$new() as IRootScopeService & { hidden: () => void; shown: () => void };
    scope.hidden = vi.fn();
    scope.shown = vi.fn();
    const element = $compile(`
      <button ngb-tooltip="'Tip'" triggers="manual" animation="false" shown="shown()" hidden="hidden()">Host</button>
    `)(scope);
    angular.element(document.body).append(element);
    scope.$digest();
    const tooltip = element.controller("ngbTooltip") as { close(): void; open(): IPromise<void> };
    await settle(tooltip.open());
    await settle(tooltip.open());
    expect(scope.shown).toHaveBeenCalledOnce();
    tooltip.close();
    scope.$digest();
    tooltip.close();
    expect(scope.hidden).toHaveBeenCalledOnce();
  });

  it("applies a custom class and appends to the requested container", async () => {
    const host = $compile(`
      <div><div id="tooltip-container"></div><button ngb-tooltip="'Tip'" tooltip-class="custom-tip"
        container="#tooltip-container" triggers="manual" animation="false">Host</button></div>
    `)($rootScope.$new());
    angular.element(document.body).append(host);
    $rootScope.$digest();
    const button = angular.element(host[0].querySelector("button") as HTMLElement);
    await settle((button.controller("ngbTooltip") as { open(): IPromise<void> }).open());
    expect(host[0].querySelector("#tooltip-container .tooltip.custom-tip")).not.toBeNull();
  });
});
