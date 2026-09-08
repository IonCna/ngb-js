import type { NgbScrollSpyFragment } from "@ngb/scrollspy/ngb-scrollspy-fragment.directive";
import {
  type NgbScrollSpyProcessChanges,
  NgbScrollSpyService,
  type NgbScrollToOptions,
} from "@ngb/scrollspy/scrollspy.service";
import { type AfterViewInit, Directive, ElementRef, HostBinding, Input, inject, Output } from "ngjs-core";
import type { Observable } from "rxjs";
import type { NgbScrollSpyRef } from "./ngb-scrollspy-item.directive";

@Directive({
  selector: "[ngbScrollSpy]",
  exportAs: "ngbScrollSpy",
  providers: [NgbScrollSpyService],
})
export class NgbScrollSpy implements NgbScrollSpyRef, AfterViewInit {
  static ngAcceptInputType_scrollBehavior: string;

  private _initialFragment: string | null = null;
  private _service = inject(NgbScrollSpyService);
  private _nativeElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  @Input() processChanges?: NgbScrollSpyProcessChanges;
  @Input() rootMargin?: string;
  @Input() scrollBehavior?: "auto" | "smooth";
  @Input() threshold?: number | number[];

  @Input()
  set active(fragment: string) {
    this._initialFragment = fragment;
    this.scrollTo(fragment);
  }

  @Output() activeChange = this._service.active$;

  @HostBinding("attr.tabindex")
  readonly _tabindex = "0";

  @HostBinding("style.overflow-y")
  readonly _overflowY = "auto";

  get active(): string {
    return this._service.active;
  }

  get active$(): Observable<string> {
    return this._service.active$;
  }

  ngAfterViewInit(): void {
    this._service.start({
      processChanges: this.processChanges,
      root: this._nativeElement,
      rootMargin: this.rootMargin,
      threshold: this.threshold,
      ...(this._initialFragment && { initialFragment: this._initialFragment }),
    });
  }

  /**
   * @internal
   */
  _registerFragment(fragment: NgbScrollSpyFragment): void {
    this._service.observe(fragment.id);
  }

  /**
   * @internal
   */
  _unregisterFragment(fragment: NgbScrollSpyFragment): void {
    this._service.unobserve(fragment.id);
  }

  scrollTo(fragment: string | HTMLElement, options?: NgbScrollToOptions): void {
    this._service.scrollTo(fragment, {
      ...(this.scrollBehavior && { behavior: this.scrollBehavior }),
      ...options,
    });
  }
}
