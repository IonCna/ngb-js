import type { NgbNav } from "@ngb/nav/ngb-nav.directive";
import type { NgbNavItem } from "@ngb/nav/ngb-nav-item.directive";
import { NgbNavPane } from "@ngb/nav/ngb-nav-pane.directive";
import { ngbNavFadeInTransition, ngbNavFadeOutTransition } from "@ngb/nav/ngb-nav-transition";
import { type NgbTransitionOptions, ngbRunTransition } from "@ngb/utils";
import {
  type AfterViewInit,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Input,
  inject,
  NgZone,
  type QueryList,
  ViewChildren,
} from "ngjs-core";
import { takeUntilDestroyed } from "ngjs-core/rxjs-interop";
import { distinctUntilChanged, skip, startWith } from "rxjs";

@Component({
  selector: "[ngbNavOutlet]",
  template: `
        <div
          ng-repeat="item in $.nav.items.toArray() track by item.domId"
          ng-if="item.isPanelInDom() || $.isPanelTransitioning(item)"
          ngb-nav-pane
          item="item"
          nav="$.nav"
          role="$.paneRole">
          <ng-container
            ng-template-outlet="item.contentTpl"
            ng-template-outlet-context="{ $implicit: item.active || $.isPanelTransitioning(item) }">
          </ng-container>
        </div>
      `,
})
export class NgbNavOutlet implements AfterViewInit {
  private _cd = inject(ChangeDetectorRef);
  private _ngZone = inject(NgZone);
  private _activePane: NgbNavPane | null = null;

  @ViewChildren(NgbNavPane)
  private _panes!: QueryList<NgbNavPane>;

  @Input() paneRole?: string;
  @Input("ngbNavOutlet") nav!: NgbNav;

  @HostBinding("class.tab-content")
  readonly _tabContentClass = true;

  isPanelTransitioning(item: NgbNavItem): boolean {
    return this._activePane?.item === item;
  }

  ngAfterViewInit(): void {
    this._updateActivePane();

    this.nav.navItemChange$
      .pipe(
        takeUntilDestroyed(this.nav.destroyRef),
        startWith(this._activePane?.item ?? null),
        distinctUntilChanged(),
        skip(1),
      )
      .subscribe((nextItem) => {
        const options: NgbTransitionOptions<undefined> = {
          animation: this.nav.animation,
          runningTransition: "stop",
        };

        this._cd.detectChanges();

        if (this._activePane) {
          ngbRunTransition(this._ngZone, this._activePane.nativeElement, ngbNavFadeOutTransition, options).subscribe(
            () => {
              const activeItem = this._activePane?.item;
              this._activePane = this._getPaneForItem(nextItem);
              this._cd.markForCheck();

              if (this._activePane) {
                this._activePane.nativeElement.classList.add("active");
                ngbRunTransition(
                  this._ngZone,
                  this._activePane.nativeElement,
                  ngbNavFadeInTransition,
                  options,
                ).subscribe(() => {
                  if (nextItem) {
                    nextItem.shown.emit();
                    this.nav.shown.emit(nextItem.id);
                  }
                });
              }

              if (activeItem) {
                activeItem.hidden.emit();
                this.nav.hidden.emit(activeItem.id);
              }
            },
          );
        } else {
          this._updateActivePane();
        }
      });
  }

  private _updateActivePane(): void {
    this._activePane = this._getActivePane();
    this._activePane?.nativeElement.classList.add("show", "active");
  }

  private _getPaneForItem(item: NgbNavItem | null): NgbNavPane | null {
    return this._panes.find((pane) => pane.item === item) ?? null;
  }

  private _getActivePane(): NgbNavPane | null {
    return this._panes.find((pane) => pane.item.active) ?? null;
  }
}
