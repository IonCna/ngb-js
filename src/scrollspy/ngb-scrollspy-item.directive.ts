import { NgbScrollSpyMenu } from "@ngb/scrollspy/ngb-scrollspy-menu.directive";
import { NgbScrollSpy } from "@ngb/scrollspy/ngb-scrollspy.directive";
import { NgbScrollSpyService, type NgbScrollToOptions } from "@ngb/scrollspy/scrollspy.service";
import { ChangeDetectorRef, Directive, HostBinding, HostListener, inject, Input, type OnDestroy, type OnInit } from "ngjs-core";
import type { Observable, Subscription } from "rxjs";

export interface NgbScrollSpyRef {
  get active(): string;
  get active$(): Observable<string>;
  scrollTo(fragment: string | HTMLElement, options?: NgbScrollToOptions): void;
}

type NgbScrollSpyItemData = NgbScrollSpy | string | [NgbScrollSpy, string, string?];

@Directive({
  selector: "[ngbScrollSpyItem]",
  exportAs: "ngbScrollSpyItem",
})
export class NgbScrollSpyItem implements OnInit, OnDestroy {
  private _changeDetector = inject(ChangeDetectorRef);
  private _scrollSpyMenu = inject<NgbScrollSpyMenu>(NgbScrollSpyMenu, { optional: true });
  private _scrollSpyAPI: NgbScrollSpyRef = this._scrollSpyMenu ?? inject(NgbScrollSpyService);
  private _activeSubscription?: Subscription;
  private _isActive = false;

  @Input("ngbScrollSpyItem")
  set data(data: NgbScrollSpyItemData) {
    if (Array.isArray(data)) {
      this._scrollSpyAPI = data[0];
      this.fragment = data[1];
      this.parent ??= data[2];
    } else if (data instanceof NgbScrollSpy) {
      this._scrollSpyAPI = data;
    } else if (typeof data === "string") {
      this.fragment = data;
    }
  }

  @Input() fragment!: string;
  @Input() parent?: string;

  @HostBinding("class.active")
  isActive(): boolean {
    return this._isActive;
  }

  ngOnInit(): void {
    if (!this._scrollSpyMenu) {
      this._activeSubscription = this._scrollSpyAPI.active$.subscribe((active: string) => {
        if (active === this.fragment) {
          this._activate();
        } else {
          this._deactivate();
        }
        this._changeDetector.markForCheck();
      });
    }
  }

  ngOnDestroy(): void {
    this._activeSubscription?.unsubscribe();
  }

  /**
   * @internal
   */
  _activate(): void {
    this._isActive = true;
    this._scrollSpyMenu?.getItem(this.parent ?? "")?._activate();
  }

  /**
   * @internal
   */
  _deactivate(): void {
    this._isActive = false;
    this._scrollSpyMenu?.getItem(this.parent ?? "")?._deactivate();
  }

  @HostListener("click")
  scrollTo(options?: NgbScrollToOptions): void {
    this._scrollSpyAPI.scrollTo(this.fragment, options);
  }
}
