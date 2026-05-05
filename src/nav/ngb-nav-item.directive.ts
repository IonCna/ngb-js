import type { IController, IDirective, IScope, ITranscludeFunction } from "angular";
import angular from "angular";

import { NgbNav } from "@ngb/nav/ngb-nav.directive"
import { navMap } from "@ngb/nav/ngb-nav.module"

import { NgbNavContent } from "./ngb-nav-content.directive"
import { NgbNavLink } from "./ngb-nav-link.directive"
import { NgbNavTabChangeEvent } from "./ngb-nav.events"

let counter = 0

export class NgbNavItem implements IController {
    private ngbNavItem!: any
    private ngbNav!: NgbNav
    private parentScope!: IScope

    private content!: ITranscludeFunction
    private toggleFn!: (active: boolean) => void

    constructor(
        private $element: JQLite,
    ) { }

    $onInit(): void {
        void this.ngbNav
        this.ngbNavItem = this.ngbNavItem ?? counter++
    }

    $postLink(): void {
        this.$element.addClass("nav-item")
        this.$element.attr("role", "presentation")
    }

    public register(parentScope: IScope) {
        this.parentScope = parentScope

        const { $transclude, toggle } = this.scan()
        this.content = $transclude
        this.toggleFn = toggle

        return {
            $transclude: this.content,
            toggle: this.toggleFn,
            el: this.$element,
            id: this.ngbNavItem
        }
    }

    public emit() {
        this.parentScope.$emit(NgbNavTabChangeEvent, this.ngbNavItem)
    }

    private scan() {
        const buttonHost = this.$element[0].querySelector("[ngb-nav-link]")
        const contentHost = this.$element[0].querySelector("[ngb-nav-content]")

        const button = angular.element(buttonHost ?? "<button></button>");
        const content = angular.element(contentHost ?? "")

        const btnCtrl = button.controller(NgbNavLink.$name) as NgbNavLink
        const contentCtrl = content.controller(NgbNavContent.$name) as NgbNavContent
        if (!btnCtrl || !contentCtrl) {
            throw new Error(`[${NgbNavItem.$name}] requires both [${NgbNavLink.$name}] and [${NgbNavContent.$name}]`)
        }

        const { toggle } = btnCtrl.register()
        const { content: $transclude } = contentCtrl.register()

        return { toggle, $transclude }
    }

    //#region $angular

    static get $inject() {
        return ['$element', '$scope']
    }

    static get $name() {
        return "ngbNavItem"
    }

    static get $factory(): () => IDirective {
        return () => ({
            controller: this,
            bindToController: true,
            require: {
                ngbNav: `^${NgbNav.$name}`
            },
            scope: {
                ngbNavItem: "<"
            }
        })
    }

    //#endregion
}
