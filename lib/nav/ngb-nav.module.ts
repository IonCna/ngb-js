import angular, { type IScope, type ITranscludeFunction } from "angular";
import { NgbNav } from "./ngb-nav.directive"
import { NgbNavContent } from "./ngb-nav-content.directive"
import { NgbNavItem } from "./ngb-nav-item.directive"
import { NgbNavItemRole } from "./ngb-nav-item-role.directive"
import { NgbNavLink } from "./ngb-nav-link.directive"
import { NgbNavLinkButton } from "./ngb-nav-link-button.directive"
import { NgbNavOutlet } from "./ngb-nav-outlet.directive"
import { NgbNavConfig } from "./ngb-nav-config.service"
import { NgbNavPane } from "./ngb-nav-pane.directive"

export interface NgbNavContentContext {
    $implicit: boolean
}

export interface LinkItem {
    el: JQLite,
    id: any,
    ctrl: NgbNavItem
}

export interface NgbNavChangeEvent<T> {
    activeId: T
    nextId: T
    preventDefault: () => void
}

export const navMap = new WeakMap<NgbNav, NavState>()

interface NavState {
    contents: Map<any, TabMap>
    scope: IScope,
    config: {
        activeId: any
        animation: boolean
        destroyOnHide: boolean
        keyboard: boolean
        orientation: "vertical" | "horizontal",
        roles: string | boolean
    },
    events: {
        activeIdChange?: ({ $event }: { $event: any }) => void
        hidden?: () => void
        navChange?: () => void
        shown?: () => void
    }
}

export type TabMap = {
    toggleFn: (active: boolean) => void
    transcludeFn: ITranscludeFunction
    tabId: any
    el: JQLite
}

export const NgbNavModule = angular.module("ngb.nav", [])

NgbNavModule.directive(NgbNav.$name, NgbNav.$factory)
NgbNavModule.service(NgbNavConfig.$name, NgbNavConfig)
NgbNavModule.directive(NgbNavLinkButton.$name, NgbNavLinkButton.$factory)
NgbNavModule.directive(NgbNavContent.$name, NgbNavContent.$factory)
NgbNavModule.directive(NgbNavItem.$name, NgbNavItem.$factory)
NgbNavModule.directive(NgbNavItemRole.$name, NgbNavItemRole.$factory)
NgbNavModule.directive(NgbNavOutlet.$name, NgbNavOutlet.$factory)
NgbNavModule.directive(NgbNavLink.$name, NgbNavLink.$factory)
NgbNavModule.directive(NgbNavPane.$name, NgbNavPane.$factory)
