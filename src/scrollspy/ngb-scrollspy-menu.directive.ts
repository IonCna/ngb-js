import type { NgbScrollSpy } from "@ngb/scrollspy/ngb-scrollspy.directive";
import { NgbScrollSpyItem } from "@ngb/scrollspy/ngb-scrollspy-item.directive";
import { NgbScrollSpyService, type NgbScrollToOptions } from "@ngb/scrollspy/scrollspy.service";
import type { IController, IDirective } from "angular";
import { ContentChildren, type QueryList } from "ngjs-core";
import type { Observable, Subscription } from "rxjs";

export class NgbScrollSpyMenu implements IController {
  private _scrollSpyRef!: NgbScrollSpy | NgbScrollSpyService;
  private _map = new Map<string, NgbScrollSpyItem>();
  private _lastActiveItem: NgbScrollSpyItem | null = null;
  private _activeSubscription?: Subscription;
  private _itemsSubscription?: Subscription;

  @ContentChildren(NgbScrollSpyItem, { descendants: true })
  private _items!: QueryList<NgbScrollSpyItem>;

  public scrollSpy?: NgbScrollSpy;
  public parentScrollSpy?: NgbScrollSpy;

  constructor(private $scrollSpy: NgbScrollSpyService) {}

  $onInit(): void {
    this._scrollSpyRef = this.scrollSpy ?? this.parentScrollSpy ?? this.$scrollSpy;
  }

  $postLink(): void {
    this._rebuildMap();
    this._itemsSubscription = this._items.changes.subscribe(() => this._rebuildMap());
    this._activeSubscription = this._scrollSpyRef.active$.subscribe((activeId: string) => {
      this._lastActiveItem?._deactivate();

      const item = this._map.get(activeId);

      if (!item) {
        return;
      }

      item._activate();
      this._lastActiveItem = item;
    });
  }

  $onDestroy(): void {
    this._activeSubscription?.unsubscribe();
    this._itemsSubscription?.unsubscribe();
    this._map.clear();
    this._lastActiveItem = null;
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

  private _rebuildMap(): void {
    this._map.clear();
    for (const item of this._items) this._map.set(item.fragment, item);
  }

  //#region $angular

  static get $name() {
    return "ngbScrollSpyMenu";
  }

  static get $factory(): () => IDirective {
    return () => ({
      bindToController: {
        scrollSpy: "<?ngbScrollSpyMenu",
      },
      controller: NgbScrollSpyMenu,
      require: {
        parentScrollSpy: "?^ngbScrollSpy",
      },
      scope: true,
      restrict: "A",
      transclude: true,
      template: "<ng-content></ng-content>",
    });
  }

  static get $inject() {
    return [NgbScrollSpyService.$name];
  }

  //#endregion
}
