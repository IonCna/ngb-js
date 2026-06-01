import type { IController, IDirective, IScope } from "angular";
import angular from "angular";
import {
	NgbNavChangeOutletEvent,
	NgbNavTabChangeEvent,
} from "./ngb-nav.events";
import { navMap, type TabMap } from "./ngb-nav.module";
import { NgbNavConfig } from "./ngb-nav-config.service";
import { NgbNavItem } from "./ngb-nav-item.directive";

export class NgbNav implements IController {
	private activeId?: any;
	private animation!: boolean;
	private destroyOnHide!: boolean;
	private keyboard!: boolean;
	private orientation!: "horizontal" | "vertical";
	private roles!: false | "tablist";
	private changeWatcher!: () => void;
	private activeIdChange?: ({ $event }: { $event: any }) => void;
	private hidden?: () => void;
	private navChange?: () => void;
	private shown?: () => void;

	private tabs = new Map<any, TabMap>();

	constructor(
		private config: NgbNavConfig,
		private $element: JQLite,
		private $scope: IScope,
	) {}

	$onInit(): void {
		this.animation = this.animation ?? this.config.animation;
		this.destroyOnHide = this.destroyOnHide ?? this.config.destroyOnHide;
		this.keyboard = this.keyboard ?? this.config.keyboard;
		this.orientation = this.orientation ?? this.config.orientation;
		this.roles = this.roles ?? this.config.roles;
	}

	$postLink(): void {
		this.$element.addClass("nav nav-tabs");
		this.$element.attr("role", "tablist");

		this.scan();
		this.ensureActiveTab();
		this.syncToggles();

		// register

		navMap.set(this, {
			contents: this.tabs,
			scope: this.$scope,
			config: {
				activeId: this.activeId,
				animation: this.animation,
				destroyOnHide: this.destroyOnHide,
				keyboard: this.keyboard,
				orientation: this.orientation,
				roles: this.roles,
			},
			events: {
				activeIdChange: this.activeIdChange?.bind(this),
				hidden: this.hidden?.bind(this),
				navChange: this.navChange?.bind(this),
				shown: this.shown?.bind(this),
			},
		});

		this.changeWatcher = this.$scope.$on(NgbNavTabChangeEvent, (event, id) => {
			if (id == this.activeId) return;
			if (!this.tabs.has(id)) return;

			event.preventDefault();
			event.stopPropagation?.();

			this.setActiveId(id, true);
		});
	}

	$onDestroy(): void {
		this.changeWatcher();
	}

	public select(id: any) {
		if (!this.tabs.has(id)) return;
		this.setActiveId(id, true);
	}

	private scan() {
		const itemsDOM = this.$element[0].querySelectorAll("[ngb-nav-item]");
		let firstId: any;

		itemsDOM.forEach((item) => {
			const ctrl = angular
				.element(item)
				.controller(NgbNavItem.$name) as NgbNavItem;
			const { toggle, $transclude, el, id } = ctrl.register(this.$scope);

			if (firstId === undefined) firstId = id;

			this.tabs.set(id, {
				toggleFn: toggle,
				transcludeFn: $transclude,
				el,
				tabId: id,
			});
		});

		if (this.activeId === undefined) {
			this.activeId = firstId;
		}
	}

	private ensureActiveTab() {
		if (this.activeId !== undefined && this.tabs.has(this.activeId)) return;
		this.activeId = this.tabs.keys().next().value;
	}

	private syncToggles() {
		this.tabs.forEach((tab) => {
			tab.toggleFn(tab.tabId == this.activeId);
		});
	}

	private setActiveId(id: any, emitOutlet: boolean) {
		this.activeId = id;

		const navState = navMap.get(this);
		if (navState) {
			navState.config.activeId = id;
		}

		this.syncToggles();
		this.navChange?.();
		this.activeIdChange?.({ $event: id });
		if (emitOutlet) {
			this.$scope.$emit(NgbNavChangeOutletEvent, id);
		}
	}

	//#region $angular

	static get $name() {
		return "ngbNav";
	}

	static get $inject() {
		return [NgbNavConfig.$name, "$element", "$scope"];
	}

	static get $factory(): () => IDirective {
		return () => ({
			scope: {
				activeId: "=?",
				animation: "<?",
				destroyOnHide: "<?",
				keyboard: "<?",
				orientation: "<?",
				roles: "<?",
				activeIdChange: "&?",
				hidden: "&?",
				navChange: "&?",
				shown: "&?",
			},
			bindToController: true,
			controller: NgbNav,
		});
	}

	//#endregion
}
