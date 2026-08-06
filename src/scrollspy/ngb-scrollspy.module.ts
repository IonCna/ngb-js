import { NgbScrollSpyConfig } from "@ngb/scrollspy/ngb-scrollspy-config.service";
import { NgbScrollSpyFragment } from "@ngb/scrollspy/ngb-scrollspy-fragment.directive";
import { NgbScrollSpyItem } from "@ngb/scrollspy/ngb-scrollspy-item.directive";
import { NgbScrollSpyMenu } from "@ngb/scrollspy/ngb-scrollSpy-menu.directive";
import { NgbScrollSpy } from "@ngb/scrollspy/ngb-scrollspy.directive";
import { NgbScrollSpyService } from "@ngb/scrollspy/scrollspy.service";
import angular, {type IModule} from "angular";
import { CoreModule } from "ngjs-core";

export const NgbScrollSpyModule: IModule = angular.module("ngb.scrollspy", [CoreModule.name]);

NgbScrollSpyModule.directive(NgbScrollSpy.$name, NgbScrollSpy.$factory);
NgbScrollSpyModule.directive(NgbScrollSpyFragment.$name, NgbScrollSpyFragment.$factory);
NgbScrollSpyModule.directive(NgbScrollSpyItem.$name, NgbScrollSpyItem.$factory);
NgbScrollSpyModule.directive(NgbScrollSpyMenu.$name, NgbScrollSpyMenu.$factory);

NgbScrollSpyModule.service(NgbScrollSpyConfig.$name, NgbScrollSpyConfig);
NgbScrollSpyModule.service(NgbScrollSpyService.$name, NgbScrollSpyService);
