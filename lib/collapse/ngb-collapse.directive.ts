import type { IAugmentedJQuery, IController, IDirective, IScope } from "angular";
import { NgbCollapseConfig } from "@/collapse/ngb-collapse-config.service"
import { NgbAnimationFactory } from "@/ngb-animation.factory"
import { NgbHostSynchronizerFactory } from "@/ngb-sync-host.factory"

export class NgbCollapse implements IController {
    protected animation?: boolean
    protected horizontal?: boolean
    protected ngbCollapse?: boolean

    protected ngHidden?: () => void
    protected ngbCollapseChange?: () => void
    protected shown?: () => void
    protected handler!: () => void

    private animationId = 0

    constructor(
        private $element: IAugmentedJQuery,
        private ngbCollapseConfig: NgbCollapseConfig,
        private $scope: IScope,
        private ngbAnimationFactory: NgbAnimationFactory,
        private ngbHostSynchronizerFactory: NgbHostSynchronizerFactory
    ) { }

    $onInit(): void {
        this.animation = this.animation ?? this.ngbCollapseConfig.animation
        this.horizontal = this.horizontal ?? this.ngbCollapseConfig.horizontal
        const ngbRunTransition = this.ngbAnimationFactory.$create()

        this.handler = this.$scope.$watch(() => this.ngbCollapse, async (collapsed, prev) => {
            if (prev == collapsed) return;

            const id = ++this.animationId

            this.$element.removeClass("collapse show")
            this.$element.addClass("collapsing")

            this.$element.css(this.direction, `${this.start}px`)

            const finish = () => {
                if (id !== this.animationId) return;

                this.$element.removeClass("collapsing")
                this.$element.addClass("collapse");

                if (!collapsed) {
                    this.$element.css(this.direction, "")
                    this.$element.addClass("show")
                    this.shown?.()
                } else {
                    this.$element.css(this.direction, "")
                    this.ngHidden?.()
                }

                this.ngbCollapseChange?.()
            }

            if (!this.animation) {
                this.$element.css(this.direction, `${this.end}px`)
                finish()
                return
            }

            ngbRunTransition(this.$element, () => {
                this.$element.css(this.direction, `${this.end}px`)
            }).then(finish)
        })
    }

    $postLink(): void {
        this.ngbHostSynchronizerFactory.$create(this.$element, this.$scope, {
            classNames: {
                "collapse": () => true,
                "show": () => !Boolean(this.ngbCollapse),
                "collapse-horizontal": () => !Boolean(this.horizontal)
            }
        })
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

    private get end() {
        const isOpening = !this.ngbCollapse
        const [native] = Array.from(this.$element)

        const { scrollHeight, scrollWidth } = native

        if (this.horizontal) return isOpening ? scrollWidth : 0
        return isOpening ? scrollHeight : 0
    }

    private get start() {
        const isOpening = !this.ngbCollapse
        const [native] = Array.from(this.$element)

        const { scrollHeight, scrollWidth } = native

        if (this.horizontal) return isOpening ? 0 : scrollWidth;
        return isOpening ? 0 : scrollHeight
    }

    static get $inject() {
        return [
            "$element",
            NgbCollapseConfig.$name,
            "$scope",
            NgbAnimationFactory.$name,
            NgbHostSynchronizerFactory.$name
        ]
    }

    static get $factory(): () => IDirective {
        return () => ({
            controller: NgbCollapse,
            restrict: "A",
            scope: {
                animation: "<?",
                horizontal: "<?",
                ngbCollapse: "=",
                hidden: "&?",
                ngHidden: "&?ngHidden",
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
