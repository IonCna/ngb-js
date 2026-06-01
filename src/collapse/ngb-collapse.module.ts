import { NgbCollapse } from "@ngb/collapse/ngb-collapse.directive";
import { NgbCollapseConfig } from "@ngb/collapse/ngb-collapse-config.service";
import angular from "angular";

export const NgbCollapseModule = angular.module("ngb.collapse", []);
NgbCollapseModule.directive(NgbCollapse.$name, NgbCollapse.$factory);
NgbCollapseModule.service(NgbCollapseConfig.$name, NgbCollapseConfig);
