import template from "@demo/features/demo-modal/demo-modal.component.html";
import type { NgbModal, NgbModalOptions, NgbModalRef } from "@ngb";
import type { IComponentController, IComponentOptions } from "angular";
import type { TemplateRef } from "ngjs-core";

const SIZES: Array<NgbModalOptions["size"]> = [undefined, "sm", "lg", "xl"];
const BACKDROPS: Array<boolean | "static"> = [true, false, "static"];

export class DemoModalComponent implements IComponentController {
  public lastResult = "—";
  public lastDismissed = "—";
  public templateMessage = "This content comes from an ngjs-core TemplateRef.";
  public template?: TemplateRef<unknown>;
  public animation = true;
  public centered = false;
  public scrollable = false;
  public backdrop: boolean | "static" = true;
  public keyboard = true;
  public size?: NgbModalOptions["size"];
  public fullscreen = false;

  constructor(private ngbModal: NgbModal) {}

  private buildOptions(): NgbModalOptions {
    return {
      animation: this.animation,
      centered: this.centered,
      scrollable: this.scrollable,
      backdrop: this.backdrop,
      keyboard: this.keyboard,
      fullscreen: this.fullscreen,
      size: this.size,
    };
  }

  public async open() {
    const modal = this.scrollable ? "ngbDemoModalScrollableContent" : "ngbDemoModalContent";
    const modalRef = await this.ngbModal.open(modal, this.buildOptions());
    this.observe(modalRef);
  }

  public async openTemplate() {
    if (!this.template) return;
    const modalRef = await this.ngbModal.open(this.template, this.buildOptions());
    this.observe(modalRef);
  }

  private observe(modalRef: NgbModalRef) {
    modalRef.closed.subscribe((result) => {
      this.lastResult = result;
    });

    modalRef.dismissed.subscribe((reason: unknown) => {
      this.lastDismissed = String(reason);
    });
  }

  public openMultiple() {
    for (let i = 1; i <= 3; i++) {
      this.ngbModal.open("ngbDemoModalContent", this.buildOptions());
    }
  }

  public openScrollable() {
    this.ngbModal.open("ngbDemoModalScrollableContent", {
      ...this.buildOptions(),
      scrollable: true,
      size: "lg",
    });
  }

  public openUpdateOptions() {
    this.ngbModal.open("ngbDemoModalUpdateOptionsContent", this.buildOptions());
  }

  public dismissAll() {
    this.ngbModal.dismissAll("dismissAll clicked");
  }

  public hasOpenModals(): boolean {
    return this.ngbModal.hasOpenModals();
  }

  public toggleAnimation() {
    this.animation = !this.animation;
  }
  public toggleCentered() {
    this.centered = !this.centered;
  }
  public toggleScrollable() {
    this.scrollable = !this.scrollable;
  }
  public toggleKeyboard() {
    this.keyboard = !this.keyboard;
  }
  public toggleFullscreen() {
    this.fullscreen = !this.fullscreen;
  }

  public cycleSize() {
    const idx = SIZES.indexOf(this.size);
    this.size = SIZES[(idx + 1) % SIZES.length];
  }

  public cycleBackdrop() {
    const idx = BACKDROPS.indexOf(this.backdrop);
    this.backdrop = BACKDROPS[(idx + 1) % BACKDROPS.length];
  }

  static get $name() {
    return "ngbDemoModal";
  }

  static get $inject() {
    return ["ngb.modal.service"];
  }

  static get $factory(): IComponentOptions {
    return {
      controller: DemoModalComponent,
      controllerAs: "$",
      template,
    };
  }
}
