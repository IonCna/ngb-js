import angular from "angular"
import { NgbAlert } from "@/alert/ngb-alert.component"
import { NgbAlertConfig } from "@/alert/ngb-alert-config.service"

export const NgbAlertModule = angular.module("ngb.alert", [])
NgbAlertModule.component(NgbAlert.$name, NgbAlert.$factory)
NgbAlertModule.service(NgbAlertConfig.$name, NgbAlertConfig)
