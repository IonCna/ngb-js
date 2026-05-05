import angular from "angular";
import { NgbModal } from "@ngb/modal/ngb-modal.service"
import { NgbModalStack } from "@ngb/modal/ngb-modal-stack.service"
import { NgbModalConfig } from "@ngb/modal/ngb-modal-config.service"
import { NgbModalBackdrop } from "@ngb/modal/ngb-modal-backdrop.component"
import { NgbModalWindow } from "@ngb/modal/ngb-modal-window.component"

export const NgbModalModule = angular.module("ngb.modal", [])
NgbModalModule.service(NgbModal.$name, NgbModal)
NgbModalModule.service(NgbModalStack.$name, NgbModalStack)
NgbModalModule.service(NgbModalConfig.$name, NgbModalConfig)

NgbModalModule.component(NgbModalBackdrop.$name, NgbModalBackdrop.$factory)
NgbModalModule.component(NgbModalWindow.$name, NgbModalWindow.$factory)

