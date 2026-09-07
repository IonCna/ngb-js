import { NgbScrollSpy } from "@ngb/scrollspy/ngb-scrollspy.directive";
import { Directive, HostBinding, inject, Input, type AfterViewInit, type OnDestroy } from "ngjs-core";

@Directive({
  selector: "[ngbScrollSpyFragment]",
})
export class NgbScrollSpyFragment implements AfterViewInit, OnDestroy {
  private _scrollSpy = inject(NgbScrollSpy);

  @Input("ngbScrollSpyFragment") id!: string;

  @HostBinding("attr.id")
  get _id(): string {
    return this.id;
  }

  ngAfterViewInit(): void {
    this._scrollSpy._registerFragment(this);
  }

  ngOnDestroy(): void {
    this._scrollSpy._unregisterFragment(this);
  }
}
