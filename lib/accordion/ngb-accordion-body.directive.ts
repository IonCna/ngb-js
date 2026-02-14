import type { IAugmentedJQuery, ICompileService, IController, IDirective, IScope } from "angular";
import type { NgbAccordionItem } from "@/accordion/ngb-accordion-item.directive"

export class NgbAccordionBody implements IController {
    private ngbAccordionItem!: NgbAccordionItem
    private template?: HTMLTemplateElement

    private built = false
    private viewScope?: IScope
    private viewNodes?: JQLite

    constructor(
        private $element: IAugmentedJQuery,
        private $scope: IScope,
        private $compile: ICompileService
    ) { }

    $postLink(): void {
        this.$element.addClass("accordion-body")
        const [native] = Array.from(this.$element)

        const template = native.querySelector("template")
        if (!template) return

        this.template = template
        this.$element.empty()

        this.$scope.$watch(() => this.ngbAccordionItem["collapsed"], (collapsed) => {
            const destroyOnHide = this.ngbAccordionItem["destroyOnHide"]
            if (!destroyOnHide) return

            if (!collapsed) {
                this.build()
                return
            }

            this.destroy()
        })
    }

    private build() {
        if (!this.template || this.built) return;

        this.viewScope = this.$scope.$new()
        const fragment = this.template.content.cloneNode(true)
        const linkFn = this.$compile(fragment as Element)

        this.viewNodes = linkFn(this.viewScope)
        this.$element.append(this.viewNodes)
        this.built = true
    }

    private destroy() {
        if (!this.built) return;

        this.viewNodes?.remove()
        this.viewScope?.$destroy()

        this.viewNodes = undefined
        this.viewScope = undefined
        this.built = false
    }

    static get $name() {
        return "ngbAccordionBody"
    }

    static get $inject() {
        return ["$element", "$scope", "$compile"]
    }

    static get $factory(): () => IDirective {
        return () => ({
            controller: NgbAccordionBody,
            bindToController: true,
            require: {
                ngbAccordionItem: "^^ngbAccordionItem"
            },
            restrict: "A",
        })
    }
}
