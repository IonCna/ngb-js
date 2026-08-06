import { NgbAccordionModule } from "@ngb/accordion/ngb-accordion.module";
import { NgbAlertModule } from "@ngb/alert/ngb-alert.module";
import { NgbCarouselModule } from "@ngb/carousel/ngb-carousel.module";
import { NgbCollapseModule } from "@ngb/collapse/ngb-collapse.module";
import { NgbDropdownModule } from "@ngb/dropdown/ngb-dropdown.module";
import { NgbModalModule } from "@ngb/modal/ngb-modal.module";
import { NgbNavModule } from "@ngb/nav/ngb-nav.module";
import { NgbOffcanvasModule } from "@ngb/offcanvas/ngb-offcanvas.module";
import { NgbConfig } from "@ngb/ngb-config.service";
import { NgbContent } from "@ngb/ngb-content.directive";
import { NgbScrollbar } from "@ngb/ngb-scrollbar.service";
import { NgbProgressbarModule } from "@ngb/progressbar/ngb-progressbar.module";
import { NgbRatingModule } from "@ngb/rating/ngb-rating.module";
import { NgbScrollSpyModule } from "@ngb/scrollspy/ngb-scrollspy.module";
import { NgbToastModule } from "@ngb/toast/ngb-toast.module";
import { NgbToolTipModule } from "@ngb/tooltip/ngb-tooltip.module";
import { ARIA_LIVE_DELAY } from "@ngb/utils/accessibility/live.constant";
import { LiveService } from "@ngb/utils/accessibility/live.service";
import { PopupFactory } from "@ngb/utils/popup.service";
import { NgbRTL } from "@ngb/utils/rtl.service";
import { DigestService } from "@ngb/utils/digest.service";
import { CoreModule, CommonModule } from "ngjs-core"
import angular from "angular";

export const NgbModule = angular.module("ngb", [
  CommonModule.name,
  CoreModule.name,
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
  NgbScrollSpyModule.name,
  NgbRatingModule.name,
]);

NgbModule.service(NgbConfig.$name, NgbConfig);
NgbModule.directive(NgbContent.$name, NgbContent.$factory);
NgbModule.service(NgbScrollbar.$name, NgbScrollbar);
NgbModule.factory(PopupFactory.$name, PopupFactory);
NgbModule.service(DigestService.$name, DigestService);

NgbModule.service(LiveService.$name, LiveService);
NgbModule.service(NgbRTL.$name, NgbRTL);
NgbModule.constant(ARIA_LIVE_DELAY.$name, ARIA_LIVE_DELAY.$value);
