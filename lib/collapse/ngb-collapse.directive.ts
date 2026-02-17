import type { IAugmentedJQuery, IController, IDirective, IScope } from "angular";
import { NgbCollapseConfig } from "@/collapse/ngb-collapse-config.service"
import { ngbRunTransition } from "@/utils/animations"

export class NgbCollapse implements IController {
    protected animation?: boolean
    protected horizontal?: boolean
    protected ngbCollapse?: boolean

    protected hidden?: () => void
    protected ngbCollapseChange?: () => void
    protected shown?: () => void
    protected handler!: () => void

    private animationId = 0

    constructor(
        private $element: IAugmentedJQuery,
        private ngbCollapseConfig: NgbCollapseConfig,
        private $scope: IScope
    ) { }

    $onInit(): void {
        this.animation = this.animation ?? this.ngbCollapseConfig.animation
        this.horizontal = this.horizontal ?? this.ngbCollapseConfig.horizontal

        this.handler = this.$scope.$watch(() => this.ngbCollapse, async (collapsed, prev) => {
            if (prev == collapsed) return;

            const id = ++this.animationId
            this.$element.removeClass("show")

            if (this.animation) {
                const { start } = this.size

                this.$element.removeClass("collapse show")
                this.$element.addClass("collapsing")

                this.$element.css(this.direction, `${start}px`)

                await ngbRunTransition(this.$element, () => {
                    const { end } = this.size
                    this.$element.css(this.direction, `${end}px`)
                })
            }

            if (id !== this.animationId) return;

            this.$element.removeClass("collapsing")
            this.$element.addClass("collapse");

            if (!collapsed) {
                this.$element.css(this.direction, "")
                this.$element.addClass("show")
                this.shown?.()
            } else {
                this.$element.css(this.direction, "")
                this.hidden?.()
            }

            this.ngbCollapseChange?.()
        })
    }

    $postLink(): void {
        this.$element.addClass("collapse")

        if (!this.ngbCollapse) this.$element.addClass("show")
        if (!this.horizontal) return
        this.$element.addClass("collapse-horizontal")
    }

    $onDestroy(): void {
        this.handler()
    }

    public toggle(open: boolean = !this.ngbCollapse) {
        this.ngbCollapse = open
    }

    private get direction() {
        return this.horizontal ? "width" : "height";
    }

    private get size() {
        const isOpening = !this.ngbCollapse
        const [native] = Array.from(this.$element)

        const { scrollHeight, scrollWidth } = native

        if (this.horizontal) {
            const start = isOpening ? 0 : scrollWidth
            const end = isOpening ? scrollWidth : 0

            return { start, end }
        }

        const start = isOpening ? 0 : scrollHeight
        const end = isOpening ? scrollHeight : 0

        return { start, end }
    }

    static get $inject() {
        return ["$element", NgbCollapseConfig.$name, "$scope"]
    }

    static get $factory(): () => IDirective {
        return () => ({
            controller: NgbCollapse,
            restrict: "A",
            scope: {
                animation: "<?",
                horizontal: "<?",
                ngbCollapse: "=",
                hidden: "&?ngbHidden",
                ngbCollapseChange: "&?",
                shown: "&?"
            },
            bindToController: true
        })
    }

    static get $name() {
        return "ngbCollapse"
    }
}
