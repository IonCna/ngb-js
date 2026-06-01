import { NgbAlert } from "@ngb/alert/ngb-alert.component";
import { NgbAlertConfig } from "@ngb/alert/ngb-alert-config.service";
import angular from "angular";

export const NgbAlertModule = angular.module("ngb.alert", []);
NgbAlertModule.component(NgbAlert.$name, NgbAlert.$factory);
NgbAlertModule.service(NgbAlertConfig.$name, NgbAlertConfig);
