import type { IAugmentedJQuery, IController, IDeferred, IDirective, IDocumentService, IQService, ITimeoutService, ITranscludeFunction } from "angular"
import { NgbTooltipConfig } from "@ngb/tooltip/ngb-tooltip-config.service";
import type { PlacementArray } from "@ngb/utils/positioning";
import type { Options } from "@popperjs/core";
import { listenToTriggers } from "@ngb/utils/triggers";
import angular from "angular";
import { toNativeElement } from "@ngb/utils";

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

    private _unregisterListenersFn?: () => void
    private _mouseEnterTooltip?: IDeferred<void>
    private _mouseLeaveTooltip?: IDeferred<void>

    constructor(
        private $config: NgbTooltipConfig,
        private $element: IAugmentedJQuery,
        private $document: IDocumentService,
        private $timeout: ITimeoutService,
        private $q: IQService
    ) { }

    set ngbTooltip(value: string | ITranscludeFunction | null | undefined) {
        this._ngbTooltip = <any>value
    }

    get ngbTooltip() {
        return this._ngbTooltip
    }

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

        this._mouseEnterTooltip = this.$q.defer()
        this._mouseLeaveTooltip = this.$q.defer()

        this._unregisterListenersFn = listenToTriggers(
            this.$timeout,
            this.$q,
            this.$element,
            this.triggers,
            this.isOpen.bind(this),
            this.open.bind(this),
            this.close.bind(this),
            +this.openDelay,
            +this.closeDelay,
            this._mouseEnterTooltip.promise,
            this._mouseLeaveTooltip.promise
        )
    }

    $onDestroy(): void { }

    $postLink(): void { }

    public open() {}

    public close(animation = this.animation) {}

    public isOpen() {
        return false
    }

	private _getPositionTargetElement(): IAugmentedJQuery {
        const isString = angular.isString(this.positionTarget)
        const document = toNativeElement<Document>(this.$document)

        return isString ? document.querySelector(this.positionTarget)
    }

    static get $inject() {
        return [NgbTooltipConfig.$name, "$element", "$document", "$timeout", "$q"]
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
            require: {},
            controller: NgbTooltip,
            restrict: "A"
        })
    }
}
