import { NgbAccordionConfig } from "@ngb/accordion/ngb-accordion-config.service";
import { NgbAccordionBody } from "@ngb/accordion/ngb-accordion-body.directive";
import { NgbAccordionButton } from "@ngb/accordion/ngb-accordion-button.directive";
import { NgbAccordionCollapse } from "@ngb/accordion/ngb-accordion-collapse.directive";
import { NgbAccordionDirective } from "@ngb/accordion/ngb-accordion.directive";
import { NgbAccordionHeader } from "@ngb/accordion/ngb-accordion-header.directive";
import { NgbAccordionItem } from "@ngb/accordion/ngb-accordion-item.directive";
import { NgbAccordionToggle } from "@ngb/accordion/ngb-accordion-toggle.directive";
import { NgbCollapseModule } from "@ngb/collapse/ngb-collapse.module";
import { NgModule } from "ngjs-core";
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
  providers: [NgbAccordionConfig],
})
export class NgbAccordionModule {}
