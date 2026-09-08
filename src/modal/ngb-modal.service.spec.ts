import { NgbModal } from "@ngb/modal/ngb-modal.service";
import { ModalDismissReasons } from "@ngb/modal/ngb-modal-dismiss-reasons";
import type { NgbActiveModal, NgbModalRef } from "@ngb/modal/ngb-modal-ref";
import angular, { type IRootScopeService } from "angular";
import { Component, Injector, Input, NgModule, type TemplateRef } from "ngjs-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configureTestBed, type NgbTestBed } from "../../test/testbed";
import { NgbModule } from "../ngb.module";

@Component({
  selector: "ngb-modal-spec-content",
  controllerAs: "$",
  template: `
    <div class="modal-spec-content">{{ $.value }}</div>
    <button class="modal-spec-close" ng-click="$.ngbActiveModal.close('component result')">Close</button>
  `,
})
class NgbModalSpecContent {
  @Input() value?: string;
  @Input() ngbActiveModal!: NgbActiveModal;
}

@NgModule({ id: "ngb.modal.spec", imports: [NgbModule], declarations: [NgbModalSpecContent] })
class NgbModalSpecModule {}

describe("NgbModal", () => {
  let tb: NgbTestBed;
  let $rootScope: IRootScopeService;
  let ngbModal: NgbModal;

  beforeEach(async () => {
    tb = await configureTestBed(NgbModalSpecModule);
    $rootScope = tb.$rootScope;
    ngbModal = tb.get<Injector>(Injector.$name).get(NgbModal);
  });

  afterEach(async () => {
    ngbModal?.dismissAll("test cleanup");
    await flush();
    tb.destroy();
    document.body.innerHTML = "";
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";
  });

  async function flush(): Promise<void> {
    for (let index = 0; index < 60; index++) {
      tb.detectChanges();
      $rootScope.$digest();
      // microtask + macrotask: `createComponent` de `ngjs-core` es async y
      // resuelve por `$timeout` polling (`waitForComponentController`).
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
  }

  async function resolveOpen<T>(promise: PromiseLike<T>): Promise<T> {
    let resolved: T | undefined;
    let rejected: unknown;
    let done = false;
    promise.then(
      (value) => {
        resolved = value;
        done = true;
      },
      (reason) => {
        rejected = reason;
        done = true;
      },
    );
    await flush();
    if (rejected !== undefined) throw rejected;
    if (!done) throw new Error("Modal did not finish opening");
    return resolved as T;
  }

  it("opens component content with bindings and resolves on close", async () => {
    const modalRef = await resolveOpen(
      ngbModal.open<NgbModalSpecContent>("ngbModalSpecContent", {
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
    const host = tb.$compile(`
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

    angular.element(document.body.querySelector(".template-modal-close") as Element).triggerHandler("click");
    await flush();

    expect(await resolveOpen(modalRef.result)).toBe("template result");
    expect(document.body.querySelector(".template-modal")).toBeNull();
    host.remove();
  });

  it("honors beforeDismiss and emits the accepted dismiss reason", async () => {
    let allowDismiss = false;
    const modalRef: NgbModalRef = await resolveOpen(
      ngbModal.open("ngbModalSpecContent", {
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
    await expect(resolveOpen(modalRef.result)).rejects.toBe("accepted");
  });

  it("dismisses with the Angular-compatible reason when Escape is pressed", async () => {
    const animationFrame = vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });
    const modalRef = await resolveOpen(ngbModal.open("ngbModalSpecContent", { animation: false, keyboard: true }));
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

  it("renders default window, backdrop and accessibility semantics", async () => {
    await resolveOpen(ngbModal.open("ngbModalSpecContent", { animation: false }));
    const window = document.body.querySelector("ngb-modal-window");
    const backdrop = document.body.querySelector("ngb-modal-backdrop");
    expect(window?.classList.contains("modal")).toBe(true);
    expect(window?.classList.contains("d-block")).toBe(true);
    expect(window?.getAttribute("role")).toBe("dialog");
    expect(window?.getAttribute("aria-modal")).toBe("true");
    expect(window?.getAttribute("tabindex")).toBe("-1");
    expect(backdrop?.classList.contains("modal-backdrop")).toBe(true);
  });

  it("opens without a backdrop when requested", async () => {
    const modalRef = await resolveOpen(ngbModal.open("ngbModalSpecContent", { animation: false, backdrop: false }));
    expect(document.body.querySelector("ngb-modal-window")).not.toBeNull();
    expect(document.body.querySelector("ngb-modal-backdrop")).toBeNull();
    modalRef.close();
    await flush();
  });

  it("applies window, dialog, backdrop, fullscreen, scrolling and aria options", async () => {
    await resolveOpen(
      ngbModal.open("ngbModalSpecContent", {
        animation: false,
        ariaDescribedBy: "description",
        ariaLabelledBy: "title",
        backdropClass: "custom-backdrop",
        fullscreen: "md",
        modalDialogClass: "custom-dialog",
        role: "alertdialog",
        scrollable: true,
        windowClass: "custom-window",
      }),
    );
    const window = document.body.querySelector("ngb-modal-window");
    const dialog = window?.querySelector(".modal-dialog");
    expect(window?.classList.contains("custom-window")).toBe(true);
    expect(window?.getAttribute("aria-labelledby")).toBe("title");
    expect(window?.getAttribute("aria-describedby")).toBe("description");
    expect(window?.getAttribute("role")).toBe("alertdialog");
    expect(dialog?.classList.contains("modal-fullscreen-md-down")).toBe(true);
    expect(dialog?.classList.contains("modal-dialog-scrollable")).toBe(true);
    expect(dialog?.classList.contains("custom-dialog")).toBe(true);
    expect(document.body.querySelector("ngb-modal-backdrop")?.classList.contains("custom-backdrop")).toBe(true);
  });

  it("updates all supported window and backdrop options", async () => {
    const modalRef = await resolveOpen(ngbModal.open("ngbModalSpecContent", { animation: false }));
    modalRef.update({
      ariaDescribedBy: "updated-description",
      ariaLabelledBy: "updated-title",
      backdropClass: "updated-backdrop",
      centered: true,
      fullscreen: true,
      modalDialogClass: "updated-dialog",
      size: "xl",
      windowClass: "updated-window",
    });
    await flush();
    const window = document.body.querySelector("ngb-modal-window");
    const dialog = window?.querySelector(".modal-dialog");
    expect(window?.classList.contains("updated-window")).toBe(true);
    expect(window?.getAttribute("aria-labelledby")).toBe("updated-title");
    expect(window?.getAttribute("aria-describedby")).toBe("updated-description");
    expect(dialog?.classList.contains("modal-dialog-centered")).toBe(true);
    expect(dialog?.classList.contains("modal-fullscreen")).toBe(true);
    expect(dialog?.classList.contains("modal-xl")).toBe(true);
    expect(dialog?.classList.contains("updated-dialog")).toBe(true);
    expect(document.body.querySelector("ngb-modal-backdrop")?.classList.contains("updated-backdrop")).toBe(true);
  });

  it("attaches modal elements to selector and element containers", async () => {
    const selectorContainer = document.createElement("section");
    selectorContainer.id = "modal-container";
    document.body.appendChild(selectorContainer);
    const first = await resolveOpen(
      ngbModal.open("ngbModalSpecContent", { animation: false, container: "#modal-container" }),
    );
    expect(selectorContainer.querySelector("ngb-modal-window")).not.toBeNull();
    expect(selectorContainer.querySelector("ngb-modal-backdrop")).not.toBeNull();
    first.close();
    await flush();

    const elementContainer = document.createElement("section");
    document.body.appendChild(elementContainer);
    await resolveOpen(ngbModal.open("ngbModalSpecContent", { animation: false, container: elementContainer }));
    expect(elementContainer.querySelector("ngb-modal-window")).not.toBeNull();
  });

  it("throws for a missing container", () => {
    expect(() => ngbModal.open("ngbModalSpecContent", { container: "#missing-modal-container" })).toThrow(
      "was not found in the DOM",
    );
  });

  it("tracks active instances and dismisses all modals", async () => {
    const activeInstances = vi.fn();
    ngbModal.activeInstances.subscribe(activeInstances);
    const first = await resolveOpen(ngbModal.open("ngbModalSpecContent", { animation: false }));
    const second = await resolveOpen(ngbModal.open("ngbModalSpecContent", { animation: false }));
    expect(ngbModal.hasOpenModals()).toBe(true);
    expect(activeInstances).toHaveBeenLastCalledWith([first, second]);

    const firstDismissed = vi.fn();
    const secondDismissed = vi.fn();
    first.dismissed.subscribe(firstDismissed);
    second.dismissed.subscribe(secondDismissed);
    ngbModal.dismissAll("all done");
    await flush();
    expect(firstDismissed).toHaveBeenCalledWith("all done");
    expect(secondDismissed).toHaveBeenCalledWith("all done");
    expect(ngbModal.hasOpenModals()).toBe(false);
    expect(() => ngbModal.dismissAll()).not.toThrow();
  });

  it("ignores repeated close and dismiss calls", async () => {
    const closing = await resolveOpen(ngbModal.open("ngbModalSpecContent", { animation: false }));
    expect(() => {
      closing.close("first");
      closing.close("second");
      closing.dismiss("late");
    }).not.toThrow();
    await flush();

    const dismissing = await resolveOpen(ngbModal.open("ngbModalSpecContent", { animation: false }));
    expect(() => {
      dismissing.dismiss("first");
      dismissing.dismiss("second");
      dismissing.close("late");
    }).not.toThrow();
  });

  it("honors asynchronous beforeDismiss outcomes", async () => {
    const blocked = await resolveOpen(
      ngbModal.open("ngbModalSpecContent", { animation: false, beforeDismiss: () => Promise.resolve(false) }),
    );
    blocked.dismiss("blocked");
    await flush();
    expect(ngbModal.hasOpenModals()).toBe(true);
    blocked.close();
    await flush();

    const accepted = await resolveOpen(
      ngbModal.open("ngbModalSpecContent", { animation: false, beforeDismiss: () => Promise.resolve(true) }),
    );
    const dismissed = vi.fn();
    accepted.dismissed.subscribe(dismissed);
    accepted.dismiss("accepted");
    await flush();
    expect(dismissed).toHaveBeenCalledWith("accepted");
  });

  it("dismisses on backdrop click but not with a static backdrop", async () => {
    const dismissible = await resolveOpen(ngbModal.open("ngbModalSpecContent", { animation: false, backdrop: true }));
    const dismissed = vi.fn();
    dismissible.dismissed.subscribe(dismissed);
    const window = document.body.querySelector("ngb-modal-window") as HTMLElement;
    window.click();
    await flush();
    expect(dismissed).toHaveBeenCalledWith(ModalDismissReasons.BACKDROP_CLICK);

    await resolveOpen(ngbModal.open("ngbModalSpecContent", { animation: false, backdrop: "static" }));
    const staticWindow = document.body.querySelector("ngb-modal-window") as HTMLElement;
    staticWindow.click();
    await flush();
    expect(ngbModal.hasOpenModals()).toBe(true);
  });
});
