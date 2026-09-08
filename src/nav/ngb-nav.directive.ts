import { type NgbNavChangeEvent, NgbNavConfig } from "@ngb/nav/ngb-nav-config.service";
import { NgbNavItem } from "@ngb/nav/ngb-nav-item.directive";
import { NgbNavLinkBase } from "@ngb/nav/ngb-nav-link-base.directive";
import {
  type AfterContentInit,
  Attribute,
  ChangeDetectorRef,
  ContentChildren,
  DestroyRef,
  Directive,
  DOCUMENT,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  inject,
  Input,
  type OnChanges,
  Output,
  type QueryList,
  type SimpleChanges,
  takeUntilDestroyed,
} from "ngjs-core";
import { Subject } from "rxjs";

// biome-ignore lint/suspicious/noExplicitAny: los ids de nav aceptan cualquier tipo en ng-bootstrap
const isValidNavId = (id: any): boolean => id !== undefined && id !== null && id !== "";

@Directive({
  selector: "[ngbNav]",
  exportAs: "ngbNav",
})
export class NgbNav implements AfterContentInit, OnChanges {
  static readonly ngAcceptInputType_orientation: string;
  static readonly ngAcceptInputType_roles: boolean | string;

  private _config = inject(NgbNavConfig);
  private _cd = inject(ChangeDetectorRef);
  private _document = inject(DOCUMENT);
  private _nativeElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  readonly destroyRef = inject(DestroyRef);
  _navigatingWithKeyboard = false;

  // biome-ignore lint/suspicious/noExplicitAny: API pública compatible con ng-bootstrap
  @Input() activeId: any;
  // biome-ignore lint/suspicious/noExplicitAny: API pública compatible con ng-bootstrap
  @Output() activeIdChange = new EventEmitter<any>();
  @Input() animation = this._config.animation;
  @Input() destroyOnHide = this._config.destroyOnHide;
  @Input() orientation = this._config.orientation;
  @Input() roles = this._config.roles;
  @Input() keyboard = this._config.keyboard;
  // biome-ignore lint/suspicious/noExplicitAny: API pública compatible con ng-bootstrap
  @Output() shown = new EventEmitter<any>();
  // biome-ignore lint/suspicious/noExplicitAny: API pública compatible con ng-bootstrap
  @Output() hidden = new EventEmitter<any>();
  @Output() navChange = new EventEmitter<NgbNavChangeEvent>();

  @ContentChildren(NgbNavItem)
  items!: QueryList<NgbNavItem>;

  @ContentChildren(NgbNavLinkBase, { descendants: true })
  links!: QueryList<NgbNavLinkBase>;

  readonly navItemChange$ = new Subject<NgbNavItem | null>();

  constructor(@Attribute("role") public role: string) {}

  @HostBinding("class.nav")
  readonly _navClass = true;

  @HostBinding("class.flex-column")
  get _verticalClass(): boolean {
    return this.orientation === "vertical";
  }

  @HostBinding("attr.aria-orientation")
  get _ariaOrientation(): string | undefined {
    return this.orientation === "vertical" && this.roles === "tablist" ? "vertical" : undefined;
  }

  @HostBinding("attr.role")
  get _role(): string | undefined {
    return this.role || (this.roles ? "tablist" : undefined);
  }

  click(item: NgbNavItem): void {
    if (!item.disabled) {
      this._updateActiveId(item.id);
    }
  }

  @HostListener("focusout", ["$event"])
  onFocusout({ relatedTarget }: FocusEvent): void {
    if (!this._nativeElement.contains(relatedTarget as HTMLElement)) {
      this._navigatingWithKeyboard = false;
    }
  }

  @HostListener("keydown", ["$event"])
  onKeyDown(event: KeyboardEvent): void {
    if (this.roles !== "tablist" || !this.keyboard) {
      return;
    }

    const enabledLinks = this.links.filter((link) => !link.navItem.disabled);
    const { length } = enabledLinks;
    let position = -1;

    enabledLinks.forEach((link, index) => {
      if (link.nativeElement === this._document.activeElement) {
        position = index;
      }
    });

    if (!length) {
      return;
    }

    switch (event.key) {
      case "ArrowUp":
      case "ArrowLeft":
        position = (position - 1 + length) % length;
        break;
      case "ArrowRight":
      case "ArrowDown":
        position = (position + 1) % length;
        break;
      case "Home":
        position = 0;
        break;
      case "End":
        position = length - 1;
        break;
      default:
        return;
    }

    const link = enabledLinks[position];
    if (!link) {
      return;
    }

    if (this.keyboard === "changeWithArrows") {
      this.select(link.navItem.id);
    }

    link.nativeElement.focus();
    this._navigatingWithKeyboard = true;
    event.preventDefault();
  }

  // biome-ignore lint/suspicious/noExplicitAny: API pública compatible con ng-bootstrap
  select(id: any): void {
    this._updateActiveId(id, false);
  }

  ngAfterContentInit(): void {
    if (this.activeId === undefined || this.activeId === null) {
      const nextId = this.items.first?.id ?? null;
      if (isValidNavId(nextId)) {
        this._updateActiveId(nextId, false);
        this._cd.detectChanges();
      }
    }

    this.items.changes
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this._notifyItemChanged(this.activeId));
  }

  ngOnChanges({ activeId }: SimpleChanges): void {
    if (activeId && !activeId.isFirstChange()) {
      this._notifyItemChanged(activeId.currentValue);
    }
  }

  // biome-ignore lint/suspicious/noExplicitAny: API pública compatible con ng-bootstrap
  private _updateActiveId(nextId: any, emitNavChange = true): void {
    if (this.activeId !== nextId) {
      let defaultPrevented = false;

      if (emitNavChange) {
        this.navChange.emit({
          activeId: this.activeId,
          nextId,
          preventDefault: () => {
            defaultPrevented = true;
          },
        });
      }

      if (!defaultPrevented) {
        this.activeId = nextId;
        this.activeIdChange.emit(nextId);
        this._notifyItemChanged(nextId);
      }
    }
  }

  // biome-ignore lint/suspicious/noExplicitAny: API pública compatible con ng-bootstrap
  private _notifyItemChanged(nextItemId: any): void {
    this.navItemChange$.next(this._getItemById(nextItemId));
  }

  // biome-ignore lint/suspicious/noExplicitAny: API pública compatible con ng-bootstrap
  private _getItemById(itemId: any): NgbNavItem | null {
    return this.items.find((item) => item.id === itemId) ?? null;
  }
}
