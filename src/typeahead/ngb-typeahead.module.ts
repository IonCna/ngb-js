import { NgbHighlight } from "@ngb/typeahead/ngb-highlight.component";
import { NgbTypeahead } from "@ngb/typeahead/ngb-typeahead.directive";
import { NgModule } from "ngjs-core";
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
})
export class NgbTypeaheadModule {}
