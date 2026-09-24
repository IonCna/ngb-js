import { NgbAccordionModule } from "@ngb/accordion/ngb-accordion.module";
import { NgbAlertModule } from "@ngb/alert/ngb-alert.module";
import { NgbCarouselModule } from "@ngb/carousel/ngb-carousel.module";
import { NgbCollapseModule } from "@ngb/collapse/ngb-collapse.module";
import { NgbDatepickerModule } from "@ngb/datepicker/ngb-datepicker.module";
import { NgbDropdownModule } from "@ngb/dropdown/ngb-dropdown.module";
import { NgbModalModule } from "@ngb/modal/ngb-modal.module";
import { NgbNavModule } from "@ngb/nav/ngb-nav.module";
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
import { NgModule } from "ngjs-core";

@NgModule({
  controllerAs: "$",
  imports: [
    NgbAccordionModule,
    NgbAlertModule,
    NgbCarouselModule,
    NgbCollapseModule,
    NgbDatepickerModule,
    NgbDropdownModule,
    NgbModalModule,
    NgbNavModule,
    NgbOffcanvasModule,
    NgbPaginationModule,
    NgbPopoverModule,
    NgbProgressbarModule,
    NgbRatingModule,
    NgbScrollSpyModule,
    NgbTimepickerModule,
    NgbToastModule,
    NgbTooltipModule,
    NgbTypeaheadModule,
  ],
})
export class NgbModule {}
