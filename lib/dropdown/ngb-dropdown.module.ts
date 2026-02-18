import angular from "angular";
import { NgbDropdown } from "./ngb-dropdown.directive";
import { NgbDropdownToggle } from "./ngb-dropdown-toggle.directive";
import { NgbDropdownMenu } from "./ngb-dropdown-menu.directive"
import { NgbDropdownItem } from "./ngb-dropdown-item.directive";
import { NgbDropdownConfig } from "./ngb-dropdown-config.service"
import { NgbDropdownAnchor } from "./ngb-dropdown-anchor.directive"
import { NgbDropdownButtonItem } from "./ngb-dropdown-button-item.directive"
import type { ComputePositionConfig, Placement } from "@floating-ui/dom";

export { NgbDropdown } from "./ngb-dropdown.directive";
export { NgbDropdownToggle } from "./ngb-dropdown-toggle.directive";
export { NgbDropdownMenu } from "./ngb-dropdown-menu.directive"
export { NgbDropdownItem } from "./ngb-dropdown-item.directive";
export { NgbDropdownConfig } from "./ngb-dropdown-config.service"
export { NgbDropdownAnchor } from "./ngb-dropdown-anchor.directive"
export { NgbDropdownButtonItem } from "./ngb-dropdown-button-item.directive"

export type PopperDataBinding = {
    container: "body" | null
    dropdownClass?: string
    defaultOpen: boolean
    placement: Placement
    popperOptions?: (opts?: Partial<ComputePositionConfig>) => Partial<ComputePositionConfig>
    autoClose: boolean
}

export type DropdownConfigSave = WeakMap<NgbDropdown, PopperDataBinding>

export type DropdownDataConfig = {
    autoClose: boolean | "inside" | "outside"
}

export const NgbDropdownModule = angular.module("ngb.dropdown", [])
NgbDropdownModule.directive(NgbDropdown.$name, NgbDropdown.$factory)
NgbDropdownModule.directive(NgbDropdownToggle.$name, NgbDropdownToggle.$factory)
NgbDropdownModule.directive(NgbDropdownMenu.$name, NgbDropdownMenu.$factory)
NgbDropdownModule.directive(NgbDropdownItem.$name, NgbDropdownItem.$factory)
NgbDropdownModule.directive(NgbDropdownAnchor.$name, NgbDropdownAnchor.$factory)
NgbDropdownModule.directive(NgbDropdownButtonItem.$name, NgbDropdownButtonItem.$factory)

NgbDropdownModule.service(NgbDropdownConfig.$name, NgbDropdownConfig)
NgbDropdownModule.constant("$dropdownConfigSave", new WeakMap() as DropdownConfigSave)