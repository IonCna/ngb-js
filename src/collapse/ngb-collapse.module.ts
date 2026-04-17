import angular from "angular";
import { NgbCollapse } from "@/collapse/ngb-collapse.directive"
import { NgbCollapseConfig } from "@/collapse/ngb-collapse-config.service"

export const NgbCollapseModule = angular.module("ngb.collapse", [])
NgbCollapseModule.directive(NgbCollapse.$name, NgbCollapse.$factory)
NgbCollapseModule.service(NgbCollapseConfig.$name, NgbCollapseConfig)
