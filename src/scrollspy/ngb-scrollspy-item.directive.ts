import { NgbScrollSpy } from "@ngb/scrollspy/ngb-scrollspy.directive";
import { NgbScrollSpyMenu } from "@ngb/scrollspy/ngb-scrollspy-menu.directive";
import { NgbScrollSpyService, type NgbScrollToOptions } from "@ngb/scrollspy/scrollspy.service";
import {
  ChangeDetectorRef,
  DestroyRef,
  Directive,
  HostBinding,
  HostListener,
  Input,
  inject,
  type OnInit,
  takeUntilDestroyed,
} from "ngjs-core";
import type { Observable } from "rxjs";

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
export class NgbScrollSpyItem implements OnInit {
  private _changeDetector = inject(ChangeDetectorRef);
  private _scrollSpyMenu = inject<NgbScrollSpyMenu>(NgbScrollSpyMenu, { optional: true });
  private _scrollSpyAPI: NgbScrollSpyRef = this._scrollSpyMenu ?? inject(NgbScrollSpyService);
  private _destroyRef = inject(DestroyRef);
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

  isActive(): boolean {
    return this._isActive;
  }

  // `@HostBinding` sobre un método observa la referencia de la función (constante):
  // el `$watch` nunca dispararía el cambio. Va sobre un getter, como en el resto
  // del port. Upstream usa `host: { '[class.active]': 'isActive()' }`.
  @HostBinding("class.active")
  get _activeClass(): boolean {
    return this._isActive;
  }

  ngOnInit(): void {
    if (!this._scrollSpyMenu) {
      this._scrollSpyAPI.active$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((active: string) => {
        if (active === this.fragment) {
          this._activate();
        } else {
          this._deactivate();
        }
        this._changeDetector.markForCheck();
      });
    }
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
