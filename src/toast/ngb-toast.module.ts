import { NgbToast } from "@ngb/toast/ngb-toast.component";
import { NgbToastConfig } from "@ngb/toast/ngb-toast-config.service";
import { NgbToastHeader } from "@ngb/toast/ngb-toast-header.directive";
import angular, {type IModule} from "angular";
import { CommonModule } from "ngjs-core";

export const NgbToastModule: IModule = angular.module("ngb.toast", [CommonModule.name]);
NgbToastModule.service(NgbToastConfig.$name, NgbToastConfig);
NgbToastModule.component(NgbToast.$name, NgbToast.$factory);
NgbToastModule.directive(NgbToastHeader.$name, NgbToastHeader.$factory);
