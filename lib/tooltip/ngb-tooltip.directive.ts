import type { IAugmentedJQuery, IController, IDeferred, IDirective, IDocumentService, ITranscludeFunction } from "angular"
import type { NgbTooltipConfig } from "@/tooltip/ngb-tooltip-config.service";
import type { PlacementArray } from "@/utils/positioning";
import type { Options } from "@popperjs/core";

let nextId = 0;

export class NgbTooltip implements IController {
	static ngAcceptInputType_autoClose: boolean | string;
    private animation?: boolean
    private autoClose?: boolean | "inside" | "outside"
    private placement?: PlacementArray
    private popperOptions?: (options: Partial<Options>) => Options
    private triggers?: string
    private container?: string
    private disableTooltip?: boolean
    private tooltipClass?: string
    private openDelay?: number
    private closeDelay?: number
    private shown?: () => void
    private hidden?: () => void

    private tooltipContext?: unknown

    private positionTarget?: string | IAugmentedJQuery
    private _ngbTooltip?: string | ITranscludeFunction
    private _ngbTooltipWindowId = `ngb-tooltip-${nextId++}`

    constructor(
        private $config: NgbTooltipConfig,
        private $element: IAugmentedJQuery,
        private $document: IDocumentService
    ) { }

    $onInit(): void {
        this.animation = this.animation ?? this.$config.animation
        this.autoClose = this.autoClose ?? this.$config.autoClose
        this.placement = this.placement ?? this.$config.placement
        this.popperOptions = this.popperOptions ?? this.popperOptions
        this.triggers = this.triggers ?? this.$config.triggers
        this.container = this.container ?? this.$config.container
        this.disableTooltip = this.disableTooltip ?? this.$config.disableTooltip
        this.tooltipClass = this.tooltipClass ?? this.$config.tooltipClass
        this.openDelay = this.openDelay ?? this.$config.openDelay
        this.closeDelay = this.closeDelay ?? this.$config.closeDelay
    }

    $onDestroy(): void { }

    $postLink(): void { }

    static get $inject() {
        return []
    }

    static get $name() {
        return "ngbTooltip"
    }

    static get $factory(): () => IDirective {
        return () => ({
            scope: true,
            bindToController: {
                animation: "<?",
                autoClose: "<?",
                closeDelay: "<?",
                container: "<?",
                disableTooltip: "<?",
                ngbTooltip: "<",
                openDelay: "<?",
                placement: "<?",
                popperOptions: "<?",
                positionTarget: "<?",
                tooltipClass: "<?",
                tooltipContext: "<?",
                triggers: "@?",
                hidden: "&?",
                shown: "&?"
            },
            controller: NgbTooltip,
            restrict: "A"
        })
    }
}
