import type { IAugmentedJQuery, IController, IDirective } from "angular"
import { NgbAccordion } from "@/accordion/ngb-accordion.directive"
import type { NgbAccordionCollapse } from "./ngb-accordion-collapse.directive"
import angular from "angular"

let accordionItemCounter = 0

export class NgbAccordionItem implements IController {
    private _accordion!: NgbAccordion
    private _collapsed = true
    private _destroyOnHide: boolean | undefined;

    private _collapseAnimationRunning = false
    private _collapse!: NgbAccordionCollapse
    private _id!: string

    public hidden?: () => void
    public hide?: () => void
    public show?: () => void
    public shown?: () => void

    public disabled = false

    constructor(
        private $element: IAugmentedJQuery
    ) { }

    $onInit(): void {
        this._accordion.register(this)
    }

    $postLink(): void {
        this._id = this._id ?? `ngb-accordion-item-${accordionItemCounter++}`;

        this.$element.attr("id", this._id)
        this.$element.addClass("accordion-item")
    }

    $onDestroy(): void {
        this._accordion.unregister(this)
    }

    set id(id: string) {
        if (!angular.isString(id) || id === '') return
        this._id = id
    }

    set destroyOnHide(destroyOnHide: boolean) {
        this._destroyOnHide = destroyOnHide
    }

    get destroyOnHide() {
        return angular.isUndefined(this._destroyOnHide) ? this._accordion.destroyOnHide! : this._destroyOnHide!
    }

    set collapsed(collapsed: boolean | undefined) {
        if (collapsed === undefined) return

        if (!this._accordion) {
            this._collapsed = collapsed
            return
        }

        if (collapsed) {
            this.collapse()
            return
        }

        this.expand()
    }

    get collapsed() {
        return this._collapsed;
    }

    get id() {
        return `${this._id}`;
    }

    get toggleId() {
        return `${this.id}-toggle`;
    }

    get collapseId() {
        return `${this.id}-collapse`;
    }

    get _shouldBeInDOM() {
        return !this.collapsed || this._collapseAnimationRunning || !this.destroyOnHide;
    }

    toggle() {
        this.collapsed = !this.collapsed;
    }

    register(ngbAccordionCollapse: NgbAccordionCollapse) {
        this._collapse = ngbAccordionCollapse
    }

    onCollapseHidden() {
        this._collapseAnimationRunning = false
        this.hidden?.()
        this._accordion.hidden?.({ $event: this.id })
    }

    onCollapseShown() {
        this.shown?.()
        this._accordion.shown?.({ $event: this.id })
    }

    expand() {
        if (!this.collapsed) return

        // checking if accordion allows to expand the panel in respect to 'closeOthers' flag
        if (!this._accordion._ensureCanExpand(this)) {
            return;
        }

        this._collapsed = false;

        // need if the accordion is used inside a component having OnPush change detection strategy
        //this._cd.markForCheck();

        // we need force CD to get template into DOM before starting animation to calculate its height correctly
        // this will synchronously put the item body into DOM, because `this._collapsed` was flipped to `false`
        //this._cd.detectChanges();

        // firing events before starting animations
        this.show?.();
        this._accordion.show?.({ $event: this.id });

        // we also need to make sure 'animation' flag is up-to- date
        this._collapse._collapse.animation = this._accordion.animation;
        this._collapse._collapse.collapsed = false;
    }

    collapse() {
        if (this.collapsed) return;
        this._collapsed = true;
        this._collapseAnimationRunning = true;

        // need if the accordion is used inside a component having OnPush change detection strategy
        //this._cd.markForCheck();

        // firing events before starting animations
        this.hide?.();
        this._accordion.hide?.({ $event: this.id });

        // we also need to make sure 'animation' flag is up-to- date
        this._collapse._collapse.animation = this._accordion.animation;
        this._collapse._collapse.collapsed = true

    }

    static get $inject() {
        return [ "$element" ]
    }

    static get $name() {
        return "ngbAccordionItem"
    }

    static get $factory(): () => IDirective {
        return () => ({
            bindToController: true,
            controller: NgbAccordionItem,
            require: {
                _accordion: "^ngbAccordion"
            },
            restrict: "A",
            scope: {
                collapsed: "<?",
                destroyOnHide: "<?",
                disabled: "<?",
                id: "<?ngbAccordionItem",
                hidden: "&?",
                hide: "&?",
                show: "&?",
                shown: "&?"
            }
        })
    }
}
