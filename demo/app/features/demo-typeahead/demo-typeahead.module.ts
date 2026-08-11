import { DemoTypeaheadComponent } from "@demo/features/demo-typeahead/demo-typeahead.component";
import { NgbTypeaheadModule } from "@ngb/typeahead";
import angular from "angular";

export const DemoTypeaheadModule = angular.module("ngb.demo.typeahead", [NgbTypeaheadModule.name]);
DemoTypeaheadModule.component(DemoTypeaheadComponent.$name, DemoTypeaheadComponent.$factory);
