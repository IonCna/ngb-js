import type { NgbModalOptions } from "@ngb/modal/ngb-modal-config.service";
import { NgbModalConfig } from "@ngb/modal/ngb-modal-config.service";
import { NgbModalStack } from "@ngb/modal/ngb-modal-stack.service";

export class NgbModal {
  constructor(
    private ngbModalStack: NgbModalStack,
    private ngbModalConfig: NgbModalConfig,
  ) {}

  open(content: any, options: NgbModalOptions = {}) {
    const combinedOptions = {
      ...this.ngbModalConfig,
      animation: this.ngbModalConfig.animation,
      ...options,
    };

    return this.ngbModalStack.open(content, combinedOptions);
  }

  get activeInstances() {
    return this.ngbModalStack.activeInstances;
  }

  dismissAll(reason?: any) {
    this.ngbModalStack.dismissAll(reason);
  }

  hasOpenModals() {
    return this.ngbModalStack.hasOpenModals();
  }

  static get $name() {
    return "ngb.modal.service";
  }

  static get $inject() {
    return [NgbModalStack.$name, NgbModalConfig.$name];
  }
}
