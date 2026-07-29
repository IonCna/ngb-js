import type { NgbScrollSpy } from "@ngb/scrollspy/ngb-scrollspy.directive";
import type { NgbScrollSpyItem } from "@ngb/scrollspy/ngb-scrollspy-item.directive";
import { NgbScrollSpyService, type NgbScrollToOptions } from "@ngb/scrollspy/scrollspy.service";
import type { IController, IDirective } from "angular";
import type { Observable, Subscription } from "rxjs";

export class NgbScrollSpyMenu implements IController {
  private _scrollSpyRef!: NgbScrollSpy | NgbScrollSpyService;
  private _map = new Map<string, NgbScrollSpyItem>();
  private _lastActiveItem: NgbScrollSpyItem | null = null;
  private _activeSubscription?: Subscription;

  public scrollSpy?: NgbScrollSpy;
  public parentScrollSpy?: NgbScrollSpy;

  constructor(private $scrollSpy: NgbScrollSpyService) {}

  $onInit(): void {
    this._scrollSpyRef = this.scrollSpy ?? this.parentScrollSpy ?? this.$scrollSpy;
  }

  $postLink(): void {
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

  register(item: NgbScrollSpyItem): void {
    this._map.set(item.fragment, item);
  }

  unregister(item: NgbScrollSpyItem): void {
    if (this._map.get(item.fragment) !== item) {
      return;
    }

    this._map.delete(item.fragment);
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
    });
  }

  static get $inject() {
    return [NgbScrollSpyService.$name];
  }

  //#endregion
}
