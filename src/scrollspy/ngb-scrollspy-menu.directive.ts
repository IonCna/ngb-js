import { NgbScrollSpyItem, type NgbScrollSpyRef } from "@ngb/scrollspy/ngb-scrollspy-item.directive";
import { NgbScrollSpy } from "@ngb/scrollspy/ngb-scrollspy.directive";
import { NgbScrollSpyService, type NgbScrollToOptions } from "@ngb/scrollspy/scrollspy.service";
import { ContentChildren, Directive, inject, Input, type AfterViewInit, type OnDestroy, type QueryList } from "ngjs-core";
import type { Observable, Subscription } from "rxjs";

@Directive({
  selector: "[ngbScrollSpyMenu]",
})
export class NgbScrollSpyMenu implements NgbScrollSpyRef, AfterViewInit, OnDestroy {
  private _scrollSpyRef: NgbScrollSpyRef = inject(NgbScrollSpyService);
  private _map = new Map<string, NgbScrollSpyItem>();
  private _lastActiveItem: NgbScrollSpyItem | null = null;
  private _activeSubscription?: Subscription;
  private _itemsSubscription?: Subscription;

  @ContentChildren(NgbScrollSpyItem, { descendants: true })
  private _items!: QueryList<NgbScrollSpyItem>;

  @Input("ngbScrollSpyMenu")
  set scrollSpy(scrollSpy: NgbScrollSpy) {
    this._scrollSpyRef = scrollSpy;
  }

  get active(): string {
    return this._scrollSpyRef.active;
  }

  get active$(): Observable<string> {
    return this._scrollSpyRef.active$;
  }

  scrollTo(fragment: string, options?: NgbScrollToOptions): void {
    this._scrollSpyRef.scrollTo(fragment, options);
  }

  getItem(id: string): NgbScrollSpyItem | undefined {
    return this._map.get(id);
  }

  ngAfterViewInit(): void {
    this._itemsSubscription = this._items.changes.subscribe(() => this._rebuildMap());
    this._rebuildMap();

    this._activeSubscription = this._scrollSpyRef.active$.subscribe((activeId) => {
      this._lastActiveItem?._deactivate();
      const item = this._map.get(activeId);
      if (item) {
        item._activate();
        this._lastActiveItem = item;
      }
    });
  }

  ngOnDestroy(): void {
    this._activeSubscription?.unsubscribe();
    this._itemsSubscription?.unsubscribe();
    this._map.clear();
    this._lastActiveItem = null;
  }

  private _rebuildMap(): void {
    this._map.clear();
    for (const item of this._items) {
      this._map.set(item.fragment, item);
    }
  }
}
