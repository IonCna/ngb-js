import { NgbTooltipConfig } from "@ngb/tooltip/ngb-tooltip-config.service";
import { NgbTooltipWindow } from "@ngb/tooltip/ngb-tooltip-window.component";
import { ngbCompleteTransition, toNativeElement } from "@ngb/utils";
import {
	type ContentRef,
	type IPopupService,
	PopupFactory,
} from "@ngb/utils/popup.service";
import type { PlacementArray } from "@ngb/utils/positioning";
import { listenToTriggers } from "@ngb/utils/triggers";
import type { Options } from "@popperjs/core";
import type {
	IAugmentedJQuery,
	IController,
	IDeferred,
	IDirective,
	IDocumentService,
	ILogService,
	IQService,
	ITimeoutService,
	ITranscludeFunction,
} from "angular";
import angular from "angular";

function targetIsString(target: unknown): target is string {
	return angular.isString(target);
}

let nextId = 0;

export class NgbTooltip implements IController {
	static ngAcceptInputType_autoClose: boolean | string;
	private animation?: boolean;
	private autoClose?: boolean | "inside" | "outside";
	private placement?: PlacementArray;
	private popperOptions?: (options: Partial<Options>) => Options;
	private triggers?: string;
	private container?: string;
	private disableTooltip?: boolean;
	private tooltipClass?: string;
	private openDelay?: number;
	private closeDelay?: number;
	private shown?: () => void;
	private hidden?: () => void;

	private tooltipContext?: unknown;
	private _popupService?: IPopupService;

	private positionTarget?: string | IAugmentedJQuery;
	private _ngbTooltip?: string | ITranscludeFunction;
	private _ngbTooltipWindowId = `ngb-tooltip-${nextId++}`;

	private _unregisterListenersFn?: () => void;
	private _mouseEnterTooltip?: IDeferred<void>;
	private _mouseLeaveTooltip?: IDeferred<void>;

	private _windowRef: ContentRef<NgbTooltipWindow> | null = null;
	private _opening = true;
	private _transitioning = false;

	constructor(
		private $config: NgbTooltipConfig,
		private $element: IAugmentedJQuery,
		private $document: IDocumentService,
		private $timeout: ITimeoutService,
		private $q: IQService,
		private $log: ILogService,
		private $popupFactory: PopupFactory,
	) {}

	set ngbTooltip(value: string | ITranscludeFunction | null | undefined) {
		this._ngbTooltip = <any>value;
	}

	get ngbTooltip() {
		return this._ngbTooltip;
	}

	$onInit(): void {
		this._popupService = this.$popupFactory.$create(NgbTooltipWindow.$name);

		this.animation = this.animation ?? this.$config.animation;
		this.autoClose = this.autoClose ?? this.$config.autoClose;
		this.placement = this.placement ?? this.$config.placement;
		this.popperOptions = this.popperOptions ?? this.popperOptions;
		this.triggers = this.triggers ?? this.$config.triggers;
		this.container = this.container ?? this.$config.container;
		this.disableTooltip = this.disableTooltip ?? this.$config.disableTooltip;
		this.tooltipClass = this.tooltipClass ?? this.$config.tooltipClass;
		this.openDelay = this.openDelay ?? this.$config.openDelay;
		this.closeDelay = this.closeDelay ?? this.$config.closeDelay;

		this._mouseEnterTooltip = this.$q.defer();
		this._mouseLeaveTooltip = this.$q.defer();

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
			this._mouseLeaveTooltip.promise,
		);
	}

	$onDestroy(): void {
		this.close(false);
		this._unregisterListenersFn?.();
	}

	$onChanges(changes: angular.IOnChangesObject): void {
		if (changes.tooltipClass && this.isOpen()) {
		}
	}

	$postLink(): void {}

	public open(context?: any) {
		if (!this._opening && this._transitioning) {
			this._transitioning = false;
			ngbCompleteTransition(this._windowRef!.$element);
		}

		if (!this._windowRef && this._ngbTooltip && !this.disableTooltip) {
			debugger;
			const { windowRef, transition$ } = this._popupService!.open(
				this._ngbTooltip,
				context ?? this.tooltipContext,
				this.animation,
			);

			this._opening = true;
			this._transitioning = true;
			this._windowRef = windowRef;

			this._windowRef?.setInput("animation", this.animation);
			this._windowRef?.setInput("tooltipClass", this.tooltipClass);
			this._windowRef?.setInput("id", this._ngbTooltipWindowId);

			this._windowRef.setInput("onMouseEnter", () =>
				this._mouseEnterTooltip?.notify(),
			);
			this._windowRef.setInput("onMouseLeave", () =>
				this._mouseLeaveTooltip?.notify(),
			);

			console.log(this._windowRef);
		}
	}

	public close(animation = this.animation) {
		this.$log.info("close");
	}

	public isOpen() {
		return false;
	}

	private _getPositionTargetElement(): IAugmentedJQuery {
		if (targetIsString(this.positionTarget)) {
			const el = toNativeElement(this.$document).querySelector(
				this.positionTarget,
			);

			if (!el) {
				throw new Error("element target does not exist");
			}

			return angular.element(el);
		}

		if (!this.positionTarget) {
			throw new Error("element target does not exist");
		}

		return this.positionTarget;
	}

	static get $inject() {
		return [
			NgbTooltipConfig.$name,
			"$element",
			"$document",
			"$timeout",
			"$q",
			"$log",
			PopupFactory.$name,
		];
	}

	static get $name() {
		return "ngbTooltip";
	}

	static get $factory(): () => IDirective {
		return () => ({
			scope: true,
			bindToController: {
				animation: "<?",
				autoClose: "<?",
				closeDelay: "<?",
				container: "@?",
				disableTooltip: "<?",
				ngbTooltip: "<",
				openDelay: "<?",
				placement: "<?",
				popperOptions: "<?",
				positionTarget: "<?",
				tooltipClass: "@?",
				tooltipContext: "<?",
				triggers: "@?",
				hidden: "&?",
				shown: "&?",
			},
			controller: NgbTooltip,
			restrict: "A",
		});
	}
}
