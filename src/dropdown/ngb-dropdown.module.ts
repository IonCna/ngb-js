import angular from "angular";
import { NgbDropdown } from "@ngb/dropdown/ngb-dropdown.directive";
import { NgbDropdownToggle } from "@ngb/dropdown/ngb-dropdown-toggle.directive";
import { NgbDropdownMenu } from "@ngb/dropdown/ngb-dropdown-menu.directive"
import { NgbDropdownItem } from "@ngb/dropdown/ngb-dropdown-item.directive";
import { NgbDropdownConfig } from "@ngb/dropdown/ngb-dropdown-config.service"
import { NgbDropdownAnchor } from "@ngb/dropdown/ngb-dropdown-anchor.directive"
import { NgbDropdownButtonItem } from "@ngb/dropdown/ngb-dropdown-button-item.directive"


export const NgbDropdownModule = angular.module("ngb.dropdown", [])
NgbDropdownModule.directive(NgbDropdown.$name, NgbDropdown.$factory)
NgbDropdownModule.directive(NgbDropdownToggle.$name, NgbDropdownToggle.$factory)
NgbDropdownModule.directive(NgbDropdownMenu.$name, NgbDropdownMenu.$factory)
NgbDropdownModule.directive(NgbDropdownItem.$name, NgbDropdownItem.$factory)
NgbDropdownModule.directive(NgbDropdownAnchor.$name, NgbDropdownAnchor.$factory)
NgbDropdownModule.directive(NgbDropdownButtonItem.$name, NgbDropdownButtonItem.$factory)

NgbDropdownModule.service(NgbDropdownConfig.$name, NgbDropdownConfig)
