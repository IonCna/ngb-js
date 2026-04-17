import angular from "angular";
import { NgbModal } from "@/modal/ngb-modal.service"
import { NgbModalStack } from "@/modal/ngb-modal-stack.service"
import { NgbModalConfig } from "@/modal/ngb-modal-config.service"
import { NgbModalBackdrop } from "@/modal/ngb-modal-backdrop.component"
import { NgbModalWindow } from "@/modal/ngb-modal-window.component"

export const NgbModalModule = angular.module("ngb.modal", [])
NgbModalModule.service(NgbModal.$name, NgbModal)
NgbModalModule.service(NgbModalStack.$name, NgbModalStack)
NgbModalModule.service(NgbModalConfig.$name, NgbModalConfig)

NgbModalModule.component(NgbModalBackdrop.$name, NgbModalBackdrop.$factory)
NgbModalModule.component(NgbModalWindow.$name, NgbModalWindow.$factory)

