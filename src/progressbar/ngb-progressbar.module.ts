import { NgbProgressbar } from "@ngb/progressbar/ngb-progressbar.component";
import { NgbProgressbarConfig } from "@ngb/progressbar/ngb-progressbar-config.service";
import { NgbProgressbarPercentFilter } from "@ngb/progressbar/ngb-progressbar-percent.filter";
import { NgbProgressbarStacked } from "@ngb/progressbar/ngb-progressbar-stacked.component";
import angular, {type IModule} from "angular";
import { CommonModule } from "ngjs-core";

export const NgbProgressbarModule: IModule = angular.module("ngb.progressbar", [CommonModule.name]);
NgbProgressbarModule.service(NgbProgressbarConfig.$name, NgbProgressbarConfig);
NgbProgressbarModule.component(NgbProgressbar.$name, NgbProgressbar.$factory);
NgbProgressbarModule.component(NgbProgressbarStacked.$name, NgbProgressbarStacked.$factory);
NgbProgressbarModule.filter(NgbProgressbarPercentFilter.$name, NgbProgressbarPercentFilter.$transform);
