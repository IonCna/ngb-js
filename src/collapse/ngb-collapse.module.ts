import { NgbCollapse } from "@ngb/collapse/ngb-collapse.directive";
import { NgbCollapseConfig } from "@ngb/collapse/ngb-collapse-config.service";
import angular, {type IModule} from "angular";
import { CoreModule } from "ngjs-core";

export const NgbCollapseModule: IModule = angular.module("ngb.collapse", [CoreModule.name]);
NgbCollapseModule.directive(NgbCollapse.$name, NgbCollapse.$factory);
NgbCollapseModule.service(NgbCollapseConfig.$name, NgbCollapseConfig);
