import { NgbAccordionDirective } from "@ngb/accordion/ngb-accordion.directive";
import { NgbAccordionBody } from "@ngb/accordion/ngb-accordion-body.directive";
import { NgbAccordionButton } from "@ngb/accordion/ngb-accordion-button.directive";
import { NgbAccordionCollapse } from "@ngb/accordion/ngb-accordion-collapse.directive";
import { NgbAccordionConfig } from "@ngb/accordion/ngb-accordion-config.service";
import { NgbAccordionHeader } from "@ngb/accordion/ngb-accordion-header.directive";
import { NgbAccordionItem } from "@ngb/accordion/ngb-accordion-item.directive";
import { NgbAccordionToggle } from "@ngb/accordion/ngb-accordion-toggle.directive";
import { NGB_ACCORDION_CONFIG } from "@ngb/accordion/tokens";
import { NgbCollapseModule } from "@ngb/collapse/ngb-collapse.module";
import { inject, NgModule } from "ngjs-core";
import { CommonModule } from "ngjs-core/common";

@NgModule({
  id: "ngb.accordion",
  imports: [CommonModule, NgbCollapseModule],
  declarations: [
    NgbAccordionButton,
    NgbAccordionDirective,
    NgbAccordionItem,
    NgbAccordionHeader,
    NgbAccordionToggle,
    NgbAccordionBody,
    NgbAccordionCollapse,
  ],
  providers: [{ provide: NGB_ACCORDION_CONFIG, useFactory: () => inject(NgbAccordionConfig) }],
})
export class NgbAccordionModule {}
