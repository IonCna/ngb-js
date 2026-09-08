import { NgbHighlight } from "@ngb/typeahead/ngb-highlight.component";
import { NgbTypeahead } from "@ngb/typeahead/ngb-typeahead.directive";
import { CommonModule } from "ngjs-core/runtime/common";
import { NgModule } from "ngjs-core/runtime/core";

export { NgbHighlight } from "@ngb/typeahead/ngb-highlight.component";
export { NgbTypeaheadConfig } from "@ngb/typeahead/ngb-typeahead-config.service";
export {
  NgbTypeahead,
  type NgbTypeaheadSelectItemEvent,
} from "@ngb/typeahead/ngb-typeahead.directive";
export {
  NgbTypeaheadWindow,
  type ResultTemplateContext,
} from "@ngb/typeahead/ngb-typeahead-window";

@NgModule({
  imports: [CommonModule],
  declarations: [NgbHighlight, NgbTypeahead],
})
export class NgbTypeaheadModule {}
