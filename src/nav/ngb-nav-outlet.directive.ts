import type { NgbNav } from "@ngb/nav/ngb-nav.directive";
import type { NgbNavItem } from "@ngb/nav/ngb-nav-item.directive";
import { NgbNavPane } from "@ngb/nav/ngb-nav-pane.directive";
import { ngbNavFadeInTransition, ngbNavFadeOutTransition } from "@ngb/nav/ngb-nav-transition";
import { type NgbTransitionOptions, ngbRunTransition } from "@ngb/utils";
import type { IAugmentedJQuery, IController, IDirective } from "angular";
import { ChangeDetectorRef, NgZone, type QueryList, ViewChildren } from "ngjs-core";
import type { Subscription } from "rxjs";

export class NgbNavOutlet implements IController {
  nav!: NgbNav;
  paneRole?: string;

  @ViewChildren(NgbNavPane)
  private _panes!: QueryList<NgbNavPane>;

  private _navSubscription?: Subscription;
  private _panesSubscription?: Subscription;
  private _activePane: NgbNavPane | null = null;
  private _pendingItem: NgbNavItem | null | undefined;

  constructor(
    private $element: IAugmentedJQuery,
    private _changeDetector: ChangeDetectorRef,
    private _ngZone: NgZone,
  ) {}

  isPanelTransitioning(item: NgbNavItem): boolean {
    return this._activePane?.item === item && this._pendingItem !== undefined;
  }

  $postLink(): void {
    this.$element.addClass("tab-content");
    this._updateActivePane();
    this._panesSubscription = this._panes.changes.subscribe(() => this._startPendingTransition());
    this._navSubscription = this.nav.navItemChange$.subscribe((nextItem) => {
      if (this._activePane?.item === nextItem) return;

      this._pendingItem = nextItem;
      this._changeDetector.detectChanges();
      this._startPendingTransition();
    });
  }

  $onDestroy(): void {
    this._navSubscription?.unsubscribe();
    this._panesSubscription?.unsubscribe();
  }

  private _startPendingTransition(): void {
    if (this._pendingItem === undefined) return;

    const nextItem = this._pendingItem;
    const nextPane = this._getPaneForItem(nextItem);
    if (nextItem && !nextPane) return;

    const previousPane = this._activePane;
    if (!previousPane) {
      this._activePane = nextPane;
      this._activePane?.$element.addClass("active show");
      this._pendingItem = undefined;
      return;
    }

    const options: NgbTransitionOptions<undefined> = {
      animation: this.nav.animation,
      runningTransition: "stop",
    };

    ngbRunTransition(this._ngZone, previousPane.$element, ngbNavFadeOutTransition, options).subscribe(() => {
      const previousItem = previousPane.item;
      this._activePane = this._getPaneForItem(nextItem);
      this._pendingItem = undefined;

      if (this._activePane) {
        this._activePane.$element.addClass("active");
        ngbRunTransition(this._ngZone, this._activePane.$element, ngbNavFadeInTransition, options).subscribe(
          () => {
            nextItem?.shown?.();
            if (nextItem) this.nav.shown?.({ $event: nextItem.id });
          },
        );
      }

      previousItem.hidden?.();
      this.nav.hidden?.({ $event: previousItem.id });
      this._changeDetector.markForCheck();
    });
  }

  private _updateActivePane(): void {
    this._activePane = this._getPaneForItem(this.nav.items.find((item) => item.active) ?? null);
    this._activePane?.$element.addClass("active show");
  }

  private _getPaneForItem(item: NgbNavItem | null): NgbNavPane | null {
    return this._panes.find((pane) => pane.item === item) ?? null;
  }

  //#region $angular

  static get $name() {
    return "ngbNavOutlet";
  }

  static get $inject() {
    return ["$element", ChangeDetectorRef.$name, NgZone.$name];
  }

  static get $factory(): () => IDirective {
    return () => ({
      controller: NgbNavOutlet,
      bindToController: {
        paneRole: "<?",
        nav: "<ngbNavOutlet",
      },
      restrict: "A",
      controllerAs: "$",
      scope: true,
      template: `
        <div
          ng-repeat="item in $.nav.items.toArray() track by item.domId"
          ng-if="item.isPanelInDom() || $.isPanelTransitioning(item)"
          ngb-nav-pane
          item="item"
          nav="$.nav"
          role="$.paneRole">
        </div>
      `,
    });
  }

  //#endregion
}
