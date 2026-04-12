import type { NgbModalOptions } from "@/modal/ngb-modal-config.service"
import { NgbModalStack } from "@/modal/ngb-modal-stack.service"
import { NgbModalConfig } from "@/modal/ngb-modal-config.service"

export class NgbModal {
    constructor(
        private ngbModalStack: NgbModalStack,
        private ngbModalConfig: NgbModalConfig
    ) {}

    open(content: any, options: NgbModalOptions = {}) {
        const combinedOptions = {
            ...this.ngbModalConfig,
            animation: this.ngbModalConfig.animation,
            ...options
        }

        return this.ngbModalStack.open(content, combinedOptions)
    }

    hasOpenModals() {
        return false
    }

    static get $name() {
        return "ngb.modal.service"
    }

    static get $inject() {
        return [NgbModalStack.$name, NgbModalConfig.$name]
    }
}
