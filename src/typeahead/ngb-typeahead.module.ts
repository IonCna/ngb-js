import angular from "angular";
import { NgbHighlight } from "@/typeahead/ngb-highlight.component"
import { NgbTypeaheadConfig } from "@/typeahead/ngb-typeahead-config.service"
import { NgbTypeahead } from "@/typeahead/ngb-typeahead.directive"

export const NgbTypeaheadModule = angular.module("ngb.typeahead", [])
NgbTypeaheadModule.component(NgbHighlight.$name, NgbHighlight.$factory)
NgbTypeaheadModule.service(NgbTypeaheadConfig.$name, NgbTypeaheadConfig)
NgbTypeaheadModule.directive(NgbTypeahead.$name, NgbTypeahead.$factory)
