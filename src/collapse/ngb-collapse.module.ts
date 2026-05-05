import angular from "angular";
import { NgbCollapse } from "@ngb/collapse/ngb-collapse.directive"
import { NgbCollapseConfig } from "@ngb/collapse/ngb-collapse-config.service"

export const NgbCollapseModule = angular.module("ngb.collapse", [])
NgbCollapseModule.directive(NgbCollapse.$name, NgbCollapse.$factory)
NgbCollapseModule.service(NgbCollapseConfig.$name, NgbCollapseConfig)
