import angular from "angular";
import { NgbModule } from "@ngb/ngb.module";

import { AppComponent } from "@demo/app.component";
import { DemoAccordionModule } from "@demo/features/demo-accordion/demo-accordion.module";
import { DemoAlertModule } from "@demo/features/demo-alert/demo-alert.module";
import { DemoCarouselModule } from "@demo/features/demo-carousel/demo-carousel.module";
import { DemoCollapseModule } from "@demo/features/demo-collapse/demo-collapse.module";
import { DemoDropdownModule } from "@demo/features/demo-dropdown/demo-dropdown.module";
import { DemoModalModule } from "@demo/features/demo-modal/demo-modal.module";
import { DemoProgressbarModule } from "@demo/features/demo-progressbar/demo-progressbar.module";
import { DemoToastModule } from "@demo/features/demo-toast/demo-toast.module";
import { DemoTooltipModule } from "@demo/features/demo-tooltip/demo-tooltip.module";

export const AppModule = angular.module("ngb.demo", [
	NgbModule.name,
	DemoAccordionModule.name,
	DemoAlertModule.name,
	DemoCarouselModule.name,
	DemoCollapseModule.name,
	DemoDropdownModule.name,
	DemoModalModule.name,
	DemoProgressbarModule.name,
	DemoToastModule.name,
	DemoTooltipModule.name,
]);

AppModule.component(AppComponent.$name, AppComponent.$factory);
