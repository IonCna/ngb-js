import { AppComponent } from "@demo/app.component";
import { DemoAccordionModule } from "@demo/features/demo-accordion/demo-accordion.module";
import { DemoAlertModule } from "@demo/features/demo-alert/demo-alert.module";
import { DemoCarouselModule } from "@demo/features/demo-carousel/demo-carousel.module";
import { DemoCollapseModule } from "@demo/features/demo-collapse/demo-collapse.module";
import { DemoDropdownModule } from "@demo/features/demo-dropdown/demo-dropdown.module";
import { DemoModalModule } from "@demo/features/demo-modal/demo-modal.module";
import { DemoNavModule } from "@demo/features/demo-nav/demo-nav.module";
import { DemoOffcanvasModule } from "@demo/features/demo-offcanvas/demo-offcanvas.module";
import { DemoProgressbarModule } from "@demo/features/demo-progressbar/demo-progressbar.module";
import { DemoRatingModule } from "@demo/features/demo-rating/demo-rating.module";
import { DemoScrollSpyModule } from "@demo/features/demo-scrollspy/demo-scrollspy.module";
import { DemoTimepickerModule } from "@demo/features/demo-timepicker/demo-timepicker.module";
import { DemoToastModule } from "@demo/features/demo-toast/demo-toast.module";
import { DemoTooltipModule } from "@demo/features/demo-tooltip/demo-tooltip.module";
import { DemoTypeaheadModule } from "@demo/features/demo-typeahead/demo-typeahead.module";
import { NgbModule } from "@ngb/ngb.module";
import angular from "angular";

export const AppModule = angular.module("ngb.demo", [
  NgbModule.name,
  DemoAccordionModule.name,
  DemoAlertModule.name,
  DemoCarouselModule.name,
  DemoCollapseModule.name,
  DemoDropdownModule.name,
  DemoModalModule.name,
  DemoNavModule.name,
  DemoOffcanvasModule.name,
  DemoProgressbarModule.name,
  DemoRatingModule.name,
  DemoScrollSpyModule.name,
  DemoToastModule.name,
  DemoTimepickerModule.name,
  DemoTooltipModule.name,
  DemoTypeaheadModule.name,
]);

AppModule.component(AppComponent.$name, AppComponent.$factory);
