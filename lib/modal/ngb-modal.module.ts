import angular from "angular";
import { NgbModal } from "./ngb-modal.service";
import { NgbModalWindowComponent } from "./ngb-modal-window.component";
import { NgbModalBackdropComponent } from "./ngb-modal-backdrop.component";
import { NgbModalConfig } from "./ngb-modal-config.service";
import { NgbActiveModalFactory } from "./ngb-active-modal.factory";
import { NgbModalRefFactory } from "./ngb-modal-ref.factory";
import { NgbModalStackFactory } from "./ngb-modal-stack.factory";

export { NgbModal, NgbModalDismissReasons } from "./ngb-modal.service"
export { NgbActiveModal, NgbActiveModalFactory } from "./ngb-active-modal.factory"
export { ModalRef, NgbModalRefFactory } from "./ngb-modal-ref.factory"
export { NgbModalStackFactory } from "./ngb-modal-stack.factory"
export { NgbModalWindowComponent } from "./ngb-modal-window.component"
export { NgbModalBackdropComponent } from "./ngb-modal-backdrop.component"
export { NgbModalConfig } from "./ngb-modal-config.service"

export const NgbModalModule = angular.module("ngb.modal", [])

export interface NgbModalOptions {
    animation?: boolean
    ariaDescribedBy?: string
    ariaLabelledBy?: string
    backdrop?: boolean | 'static'
    backdropClass?: string
    beforeDismiss?: () => boolean | angular.IPromise<boolean>
    centered?: boolean
    container?: string | HTMLElement
    fullscreen?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | boolean | string
    keyboard?: boolean
    modalDialogClass?: string
    role?: 'alertdialog' | 'dialog'
    scrollable?: boolean
    size?: 'sm' | 'lg' | 'xl' | string
    windowClass?: string,
    bindings?: Object
    __stackId?: number
    __stackLevel?: number
}

NgbModalModule.service(NgbModal.$name, NgbModal)
NgbModalModule.service(NgbModalConfig.$name, NgbModalConfig)
NgbModalModule.factory(NgbActiveModalFactory.$name, NgbActiveModalFactory)
NgbModalModule.factory(NgbModalRefFactory.$name, NgbModalRefFactory)
NgbModalModule.factory(NgbModalStackFactory.$name, NgbModalStackFactory)
NgbModalModule.component(NgbModalWindowComponent.$name, NgbModalWindowComponent.$factory)
NgbModalModule.component(NgbModalBackdropComponent.$name, NgbModalBackdropComponent.$factory)
