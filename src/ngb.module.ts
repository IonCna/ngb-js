import { NgbAccordionModule } from "@ngb/accordion/ngb-accordion.module";
import { NgbAlertModule } from "@ngb/alert/ngb-alert.module";
import { NgbCarouselModule } from "@ngb/carousel/ngb-carousel.module";
import { NgbCollapseModule } from "@ngb/collapse/ngb-collapse.module";
import { NgbDropdownModule } from "@ngb/dropdown/ngb-dropdown.module";
import { NgbModalModule } from "@ngb/modal/ngb-modal.module";
import { NgbNavModule } from "@ngb/nav/ngb-nav.module";
import { NgbOffcanvasModule } from "@ngb/offcanvas/ngb-offcanvas.module";
import { NgbPopoverModule } from "@ngb/popover/ngb-popover.module";
import { NgbProgressbarModule } from "@ngb/progressbar/ngb-progressbar.module";
import { NgbRatingModule } from "@ngb/rating/ngb-rating.module";
import { NgbScrollSpyModule } from "@ngb/scrollspy/ngb-scrollspy.module";
import { NgbTimepickerModule } from "@ngb/timepicker/ngb-timepicker.module";
import { NgbToastModule } from "@ngb/toast/ngb-toast.module";
import { NgbToolTipModule } from "@ngb/tooltip/ngb-tooltip.module";
import { NgbTypeaheadModule } from "@ngb/typeahead/ngb-typeahead.module";
import { NgbPaginationModule } from "@ngb/pagination/ngb-pagination.module";

import { ARIA_LIVE_DELAY } from "@ngb/utils/accessibility/live.constant";

import { NgbConfig } from "@ngb/ngb-config.service";
import { NgbScrollbar } from "@ngb/ngb-scrollbar.service";
import { LiveService } from "@ngb/utils/accessibility/live.service";
import { PopupFactory } from "@ngb/utils/popup.service";
import { NgbRTL } from "@ngb/utils/rtl.service";

import angular, { type IModule } from "angular";

export const NgbModule: IModule = angular.module("ngb", [
  NgbAlertModule.name,
  NgbProgressbarModule.name,
  NgbCollapseModule.name,
  NgbCarouselModule.name,
  NgbToastModule.name,
  NgbAccordionModule.name,
  NgbModalModule.name,
  NgbDropdownModule.name,
  NgbToolTipModule.name,
  NgbNavModule.name,
  NgbOffcanvasModule.name,
  NgbPopoverModule.name,
  NgbScrollSpyModule.name,
  NgbRatingModule.name,
  NgbTimepickerModule.name,
  NgbTypeaheadModule.name,
  NgbPaginationModule.name,
]);

NgbModule.service(NgbConfig.$name, NgbConfig);
NgbModule.service(NgbScrollbar.$name, NgbScrollbar);
NgbModule.factory(PopupFactory.$name, PopupFactory);

NgbModule.service(LiveService.$name, LiveService);
NgbModule.service(NgbRTL.$name, NgbRTL);
NgbModule.constant(ARIA_LIVE_DELAY.$name, ARIA_LIVE_DELAY.$value);
