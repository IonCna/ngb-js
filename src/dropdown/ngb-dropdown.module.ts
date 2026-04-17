import angular from "angular";
import { NgbDropdown } from "@/dropdown/ngb-dropdown.directive";
import { NgbDropdownToggle } from "@/dropdown/ngb-dropdown-toggle.directive";
import { NgbDropdownMenu } from "@/dropdown/ngb-dropdown-menu.directive"
import { NgbDropdownItem } from "@/dropdown/ngb-dropdown-item.directive";
import { NgbDropdownConfig } from "@/dropdown/ngb-dropdown-config.service"
import { NgbDropdownAnchor } from "@/dropdown/ngb-dropdown-anchor.directive"
import { NgbDropdownButtonItem } from "@/dropdown/ngb-dropdown-button-item.directive"


export const NgbDropdownModule = angular.module("ngb.dropdown", [])
NgbDropdownModule.directive(NgbDropdown.$name, NgbDropdown.$factory)
NgbDropdownModule.directive(NgbDropdownToggle.$name, NgbDropdownToggle.$factory)
NgbDropdownModule.directive(NgbDropdownMenu.$name, NgbDropdownMenu.$factory)
NgbDropdownModule.directive(NgbDropdownItem.$name, NgbDropdownItem.$factory)
NgbDropdownModule.directive(NgbDropdownAnchor.$name, NgbDropdownAnchor.$factory)
NgbDropdownModule.directive(NgbDropdownButtonItem.$name, NgbDropdownButtonItem.$factory)

NgbDropdownModule.service(NgbDropdownConfig.$name, NgbDropdownConfig)
