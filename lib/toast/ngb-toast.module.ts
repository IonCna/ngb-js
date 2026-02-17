import angular from "angular";
import { NgbToastConfig } from "@/toast/ngb-toast-config.config.service"

export const NgbToastModule = angular.module("ngb.toast", [])
NgbToastModule.service(NgbToastConfig.$name, NgbToastConfig)
