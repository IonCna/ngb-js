import { NgbModal } from "@ngb/modal/ngb-modal.service";
import { NgbModalBackdrop } from "@ngb/modal/ngb-modal-backdrop.component";
import { NgbModalConfig } from "@ngb/modal/ngb-modal-config.service";
import { NgbModalStack } from "@ngb/modal/ngb-modal-stack.service";
import { NgbModalWindow } from "@ngb/modal/ngb-modal-window.component";
import angular from "angular";
import { CommonModule } from "ngjs-core";

export const NgbModalModule = angular.module("ngb.modal", [CommonModule.name]);
NgbModalModule.service(NgbModal.$name, NgbModal);
NgbModalModule.service(NgbModalStack.$name, NgbModalStack);
NgbModalModule.service(NgbModalConfig.$name, NgbModalConfig);

NgbModalModule.component(NgbModalBackdrop.$name, NgbModalBackdrop.$factory);
NgbModalModule.component(NgbModalWindow.$name, NgbModalWindow.$factory);
