import { NgbToast } from "@ngb/toast/ngb-toast.component";
import { NgbToastConfig } from "@ngb/toast/ngb-toast-config.service";
import { NgbToastHeader } from "@ngb/toast/ngb-toast-header.directive";
import angular from "angular";

export const NgbToastModule = angular.module("ngb.toast", []);
NgbToastModule.service(NgbToastConfig.$name, NgbToastConfig);
NgbToastModule.component(NgbToast.$name, NgbToast.$factory);
NgbToastModule.directive(NgbToastHeader.$name, NgbToastHeader.$factory);
