import angular from "angular";
import { NgbToastConfig } from "@/toast/ngb-toast-config.service"
import { NgbToast } from "@/toast/ngb-toast.component"
import { NgbToastHeader } from "@/toast/ngb-toast-header.directive"

export const NgbToastModule = angular.module("ngb.toast", [])
NgbToastModule.service(NgbToastConfig.$name, NgbToastConfig)
NgbToastModule.component(NgbToast.$name, NgbToast.$factory)
NgbToastModule.directive(NgbToastHeader.$name, NgbToastHeader.$factory)
