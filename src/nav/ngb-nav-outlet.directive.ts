import type { NgbNav } from "@ngb/nav/ngb-nav.directive";
import type { NgbNavItem } from "@ngb/nav/ngb-nav-item.directive";
import type { IAugmentedJQuery, ICompileService, IController, IDirective, IScope } from "angular";
import type { Subscription } from "rxjs";

interface NgbNavPaneScope extends IScope {
  item: NgbNavItem;
  nav: NgbNav;
}

export class NgbNavOutlet implements IController {
  nav!: NgbNav;
  paneRole?: string;

  private _sub?: Subscription;
  private _activeItem: NgbNavItem | null = null;
  private _panes = new Map<NgbNavItem, { el: IAugmentedJQuery; scope: NgbNavPaneScope }>();

  constructor(
    private $element: IAugmentedJQuery,
    private $compile: ICompileService,
    private $scope: IScope,
  ) {}

  isPanelTransitioning(_item: NgbNavItem): boolean {
    return false;
  }

  $postLink(): void {
    this.$element.addClass("tab-content");
    this._update();
    this._activeItem = this.nav.items.find((i) => i.active) ?? null;
    this._sub = this.nav.navItemChange$.subscribe((nextItem) => {
      const prevItem = this._activeItem;
      this._update();
      if (prevItem !== nextItem) {
        if (prevItem) {
          prevItem.hidden?.();
          this.nav.hidden?.({ $event: prevItem.id });
        }
        if (nextItem) {
          nextItem.shown?.();
          this.nav.shown?.({ $event: nextItem.id });
        }
        this._activeItem = nextItem;
      }
    });
  }

  $onDestroy(): void {
    this._sub?.unsubscribe();
    for (const { scope } of this._panes.values()) scope.$destroy();
    this._panes.clear();
  }

  private _update(): void {
    for (const item of this.nav.items) {
      if ((item.isPanelInDom() || this.isPanelTransitioning(item)) && !this._panes.has(item)) {
        const scope = this.$scope.$new() as NgbNavPaneScope;
        scope.item = item;
        scope.nav = this.nav;
        const el = this.$compile('<div ngb-nav-pane item="item" nav="nav"></div>')(scope);
        this.$element.append(el);
        this._panes.set(item, { el, scope });
      }
    }

    for (const [item, { el, scope }] of this._panes) {
      if (!item.isPanelInDom() && !this.isPanelTransitioning(item)) {
        el.remove();
        scope.$destroy();
        this._panes.delete(item);
      } else {
        el.toggleClass("active show", item.active);
      }
    }
  }

  //#region $angular

  static get $name() {
    return "ngbNavOutlet";
  }

  static get $inject() {
    return ["$element", "$compile", "$scope"];
  }

  static get $factory(): () => IDirective {
    return () => ({
      controller: NgbNavOutlet,
      bindToController: {
        paneRole: "<?",
        nav: "<ngbNavOutlet",
      },
      restrict: "A",
      scope: true,
    });
  }

  //#endregion
}
