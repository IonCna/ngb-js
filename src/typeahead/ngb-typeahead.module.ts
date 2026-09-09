import { NgbHighlight } from "@ngb/typeahead/ngb-highlight.component";
import { NgbTypeahead } from "@ngb/typeahead/ngb-typeahead.directive";
import { NgbTypeaheadConfig } from "@ngb/typeahead/ngb-typeahead-config.service";
import { NGB_TYPEAHEAD_CONFIG } from "@ngb/typeahead/tokens";
import { inject, NgModule } from "ngjs-core";
import { CommonModule } from "ngjs-core/common";

export { NgbHighlight } from "@ngb/typeahead/ngb-highlight.component";
export {
  NgbTypeahead,
  type NgbTypeaheadSelectItemEvent,
} from "@ngb/typeahead/ngb-typeahead.directive";
export { NgbTypeaheadConfig } from "@ngb/typeahead/ngb-typeahead-config.service";
export {
  NgbTypeaheadWindow,
  type ResultTemplateContext,
} from "@ngb/typeahead/ngb-typeahead-window";

@NgModule({
  imports: [CommonModule],
  declarations: [NgbHighlight, NgbTypeahead],
  providers: [{ provide: NGB_TYPEAHEAD_CONFIG, useFactory: () => inject(NgbTypeaheadConfig) }],
})
export class NgbTypeaheadModule {}
