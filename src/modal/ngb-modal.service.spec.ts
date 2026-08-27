import { NgbModal } from "@ngb/modal/ngb-modal.service";
import { ModalDismissReasons } from "@ngb/modal/ngb-modal-dismiss-reasons";
import type { NgbActiveModal, NgbModalRef } from "@ngb/modal/ngb-modal-ref";
import type { ICompileService, IComponentOptions, IInjectorService, IRootScopeService, ITimeoutService } from "angular";
import angular from "angular";
import type { TemplateRef } from "ngjs-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NgbModule } from "../ngb.module";

class NgbModalSpecContent {
  value?: string;
  ngbActiveModal!: NgbActiveModal;

  static get $name() {
    return "ngbModalSpecContent";
  }

  static get $factory(): IComponentOptions {
    return {
      bindings: {
        ngbActiveModal: "<",
        value: "<",
      },
      controller: NgbModalSpecContent,
      controllerAs: "$",
      template: `
        <div class="modal-spec-content">{{ $.value }}</div>
        <button class="modal-spec-close" ng-click="$.ngbActiveModal.close('component result')">Close</button>
      `,
    };
  }
}

const NgbModalSpecModule = angular.module("ngb.modal.spec", []);
NgbModalSpecModule.component(NgbModalSpecContent.$name, NgbModalSpecContent.$factory);

describe("NgbModal", () => {
  let $compile: ICompileService;
  let $rootScope: IRootScopeService;
  let $timeout: ITimeoutService & { flush(): void };
  let ngbModal: NgbModal;

  beforeEach(() => {
    angular.mock.module(NgbModule.name, NgbModalSpecModule.name);
    angular.mock.inject(
      (
        _$compile_: ICompileService,
        _$rootScope_: IRootScopeService,
        _$timeout_: ITimeoutService & { flush(): void },
        _$injector_: IInjectorService,
      ) => {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        ngbModal = _$injector_.get<NgbModal>(NgbModal.$name);
      },
    );
  });

  afterEach(async () => {
    ngbModal?.dismissAll("test cleanup");
    await flush();
    document.body.innerHTML = "";
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";
  });

  async function flush(): Promise<void> {
    for (let index = 0; index < 20; index++) {
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
    if (resolved === undefined) throw new Error("Modal did not finish opening");
    return resolved;
  }

  it("opens component content with bindings and resolves on close", async () => {
    const modalRef = await resolveOpen(
      ngbModal.open(NgbModalSpecContent.$name, {
        animation: false,
        bindings: { value: "Bound modal value" },
        centered: true,
        size: "lg",
      }),
    );
    await flush();

    expect(modalRef.componentInstance).toBeInstanceOf(NgbModalSpecContent);
    expect(modalRef.componentInstance?.value).toBe("Bound modal value");
    expect(document.body.querySelector(".modal-spec-content")?.textContent).toContain("Bound modal value");
    expect(document.body.querySelector(".modal-dialog")?.classList.contains("modal-dialog-centered")).toBe(true);
    expect(document.body.querySelector(".modal-dialog")?.classList.contains("modal-lg")).toBe(true);
    expect(document.body.classList.contains("modal-open")).toBe(true);

    const closed = vi.fn();
    modalRef.closed.subscribe(closed);
    angular.element(document.body.querySelector(".modal-spec-close") as Element).triggerHandler("click");
    await flush();

    expect(closed).toHaveBeenCalledWith("component result");
    if (!modalRef.result) throw new Error("Modal result promise is missing");
    expect(await resolveOpen(modalRef.result)).toBe("component result");
    expect(document.body.querySelector("ngb-modal-window")).toBeNull();
    expect(document.body.querySelector("ngb-modal-backdrop")).toBeNull();
    expect(document.body.classList.contains("modal-open")).toBe(false);
  });

  it("renders TemplateRef context and destroys its view after closing", async () => {
    const scope = $rootScope.$new() as IRootScopeService & {
      message: string;
      modalTemplate?: TemplateRef<unknown>;
    };
    scope.message = "Template modal value";
    const host = $compile(`
      <div>
        <ng-template ng-ref="modalTemplate" let-close="close" let-dismiss="dismiss">
          <div class="template-modal">{{ message }}</div>
          <button class="template-modal-close" ng-click="close('template result')">Close template</button>
          <button class="template-modal-dismiss" ng-click="dismiss('template reason')">Dismiss template</button>
        </ng-template>
      </div>
    `)(scope);
    angular.element(document.body).append(host);
    scope.$digest();

    const modalRef = await resolveOpen(ngbModal.open(scope.modalTemplate, { animation: false }));
    await flush();
    expect(document.body.querySelector(".template-modal")?.textContent).toContain("Template modal value");
    const modalContent = document.body.querySelector("ngb-modal-window .modal-dialog > .modal-content");
    expect(modalContent).not.toBeNull();
    expect(document.body.querySelectorAll("ngb-modal-window .modal-content")).toHaveLength(1);
    expect(modalContent?.querySelector(":scope > .template-modal")).not.toBeNull();
    expect(modalContent?.querySelector(":scope > .template-modal-close")).not.toBeNull();
    expect(modalContent?.querySelector(":scope > .template-modal-dismiss")).not.toBeNull();

    angular.element(document.body.querySelector(".template-modal-close") as Element).triggerHandler("click");
    await flush();

    if (!modalRef.result) throw new Error("Modal result promise is missing");
    expect(await resolveOpen(modalRef.result)).toBe("template result");
    expect(document.body.querySelector(".template-modal")).toBeNull();
    host.remove();
  });

  it("honors beforeDismiss and emits the accepted dismiss reason", async () => {
    let allowDismiss = false;
    const modalRef: NgbModalRef = await resolveOpen(
      ngbModal.open(NgbModalSpecContent.$name, {
        animation: false,
        beforeDismiss: () => allowDismiss,
      }),
    );
    const dismissed = vi.fn();
    modalRef.dismissed.subscribe(dismissed);

    modalRef.dismiss("blocked");
    await flush();
    expect(dismissed).not.toHaveBeenCalled();
    expect(ngbModal.hasOpenModals()).toBe(true);

    allowDismiss = true;
    modalRef.dismiss("accepted");
    await flush();
    expect(dismissed).toHaveBeenCalledWith("accepted");
    expect(ngbModal.hasOpenModals()).toBe(false);
    if (!modalRef.result) throw new Error("Modal result promise is missing");
    await expect(resolveOpen(modalRef.result)).rejects.toBe("accepted");
  });

  it("dismisses with the Angular-compatible reason when Escape is pressed", async () => {
    const animationFrame = vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });
    const modalRef = await resolveOpen(ngbModal.open(NgbModalSpecContent.$name, { animation: false, keyboard: true }));
    $timeout.flush();
    await flush();
    const dismissed = vi.fn();
    modalRef.dismissed.subscribe(dismissed);

    document.body
      .querySelector("ngb-modal-window")
      ?.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Escape" }));
    await flush();

    expect(dismissed).toHaveBeenCalledWith(ModalDismissReasons.ESC);
    animationFrame.mockRestore();
  });
});
