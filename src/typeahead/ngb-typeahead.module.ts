import { NgbHighlight } from "@ngb/typeahead/ngb-highlight.component";
import { NgbTypeahead } from "@ngb/typeahead/ngb-typeahead.directive";
import { NgbTypeaheadConfig } from "@ngb/typeahead/ngb-typeahead-config.service";
import { NgbTypeaheadWindow } from "@ngb/typeahead/ngb-typeahead-window";
import { ARIA_LIVE_DELAY } from "@ngb/utils/accessibility/live.constant";
import { LiveService } from "@ngb/utils/accessibility/live.service";
import { PopupFactory } from "@ngb/utils/popup.service";
import { NgbRTL } from "@ngb/utils/rtl.service";
import angular, { type IModule } from "angular";
import { CommonModule } from "ngjs-core";

export const NgbTypeaheadModule: IModule = angular.module("ngb.typeahead", [CommonModule.name]);

NgbTypeaheadModule.constant(ARIA_LIVE_DELAY.$name, ARIA_LIVE_DELAY.$value);
NgbTypeaheadModule.factory(PopupFactory.$name, PopupFactory);
NgbTypeaheadModule.service(LiveService.$name, LiveService);
NgbTypeaheadModule.service(NgbRTL.$name, NgbRTL);
NgbTypeaheadModule.service(NgbTypeaheadConfig.$name, NgbTypeaheadConfig);

NgbTypeaheadModule.component(NgbHighlight.$name, NgbHighlight.$factory);
NgbTypeaheadModule.component(NgbTypeaheadWindow.$name, NgbTypeaheadWindow.$factory);
NgbTypeaheadModule.directive(NgbTypeahead.$name, NgbTypeahead.$factory);

export type { NgbTypeaheadSelectItemEvent } from "@ngb/typeahead/ngb-typeahead-select-item-event.model";
export { NgbHighlight, NgbTypeahead, NgbTypeaheadConfig, NgbTypeaheadWindow };
