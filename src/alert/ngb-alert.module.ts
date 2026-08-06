import { NgbAlert } from "@ngb/alert/ngb-alert.component";
import { NgbAlertConfig } from "@ngb/alert/ngb-alert-config.service";
import angular from "angular";
import { CommonModule } from "ngjs-core";

export const NgbAlertModule = angular.module("ngb.alert", [CommonModule.name]);
NgbAlertModule.component(NgbAlert.$name, NgbAlert.$factory);
NgbAlertModule.service(NgbAlertConfig.$name, NgbAlertConfig);
