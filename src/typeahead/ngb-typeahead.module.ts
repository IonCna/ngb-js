import { NgbHighlight } from "@ngb/typeahead/ngb-highlight.component";
import { NgbTypeahead } from "@ngb/typeahead/ngb-typeahead.directive";
import { NgbTypeaheadConfig } from "@ngb/typeahead/ngb-typeahead-config.service";
import angular from "angular";

export const NgbTypeaheadModule = angular.module("ngb.typeahead", []);
NgbTypeaheadModule.component(NgbHighlight.$name, NgbHighlight.$factory);
NgbTypeaheadModule.service(NgbTypeaheadConfig.$name, NgbTypeaheadConfig);
NgbTypeaheadModule.directive(NgbTypeahead.$name, NgbTypeahead.$factory);
