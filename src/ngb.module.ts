import { NgbAccordionModule } from "@ngb/accordion/ngb-accordion.module";
import { NgbAlertModule } from "@ngb/alert/ngb-alert.module";
import { NgbCarouselModule } from "@ngb/carousel/ngb-carousel.module";
import { NgbCollapseModule } from "@ngb/collapse/ngb-collapse.module";
import { NgbDatepickerModule } from "@ngb/datepicker/ngb-datepicker.module";
import { NgbDropdownModule } from "@ngb/dropdown/ngb-dropdown.module";
import { NgbModalModule } from "@ngb/modal/ngb-modal.module";
import { NgbNavModule } from "@ngb/nav/ngb-nav.module";
import { NgbConfig } from "@ngb/ngb-config.service";
import { NgbScrollbar } from "@ngb/ngb-scrollbar.service";
import { NgbOffcanvasModule } from "@ngb/offcanvas/ngb-offcanvas.module";
import { NgbPaginationModule } from "@ngb/pagination/ngb-pagination.module";
import { NgbPopoverModule } from "@ngb/popover/ngb-popover.module";
import { NgbProgressbarModule } from "@ngb/progressbar/ngb-progressbar.module";
import { NgbRatingModule } from "@ngb/rating/ngb-rating.module";
import { NgbScrollSpyModule } from "@ngb/scrollspy/ngb-scrollspy.module";
import { NgbTimepickerModule } from "@ngb/timepicker/ngb-timepicker.module";
import { NgbToastModule } from "@ngb/toast/ngb-toast.module";
import { NgbTooltipModule } from "@ngb/tooltip/ngb-tooltip.module";
import { NgbTypeaheadModule } from "@ngb/typeahead/ngb-typeahead.module";
import { ARIA_LIVE_DELAY } from "@ngb/utils/accessibility/live.constant";
import { LiveService } from "@ngb/utils/accessibility/live.service";
import { NgbRTL } from "@ngb/utils/rtl.service";
import { NgModule, registerNgModule } from "ngjs-core/runtime/core";

/**
 * Módulo raíz. Los feature modules ya convertidos a `@NgModule` entran como
 * clase; los que siguen siendo `angular.module` crudos, por `.name`. `imports`
 * de `@NgModule` acepta las dos formas + `angular.IModule`, así la migración es
 * incremental.
 */
@NgModule({
  id: "ngb",
  controllerAs: "$",
  imports: [
    NgbAlertModule,
    NgbProgressbarModule,
    NgbCollapseModule.name,
    NgbCarouselModule.name,
    NgbToastModule,
    NgbAccordionModule.name,
    NgbModalModule.name,
    NgbDropdownModule.name,
    NgbTooltipModule.name,
    NgbNavModule.name,
    NgbOffcanvasModule.name,
    NgbPopoverModule.name,
    NgbScrollSpyModule.name,
    NgbRatingModule.name,
    NgbTimepickerModule.name,
    NgbTypeaheadModule.name,
    NgbPaginationModule,
    NgbDatepickerModule.name,
  ],
  providers: [
    NgbConfig,
    NgbScrollbar,
    LiveService,
    NgbRTL,
    { provide: ARIA_LIVE_DELAY.$name, useValue: ARIA_LIVE_DELAY.$value },
  ],
})
class NgbRootModule {}

/** El único `registerNgModule` — el borde público (`angular.module("app", [NgbModule.name])`). */
export const NgbModule = registerNgModule(NgbRootModule);
