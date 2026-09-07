import type { NgbNav } from "@ngb/nav/ngb-nav.directive";
import type { NgbNavItem } from "@ngb/nav/ngb-nav-item.directive";
import { Directive, ElementRef, HostBinding, inject, Input } from "ngjs-core";

@Directive({
  selector: "[ngbNavPane]",
})
export class NgbNavPane {
  nativeElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  @Input() item!: NgbNavItem;
  @Input() nav!: NgbNav;
  @Input() role?: string;

  @HostBinding("attr.id")
  get _id(): string {
    return this.item.panelDomId;
  }

  @HostBinding("class.tab-pane")
  readonly _tabPaneClass = true;

  @HostBinding("class.fade")
  get _fadeClass(): boolean {
    return this.nav.animation;
  }

  @HostBinding("attr.role")
  get _role(): string | undefined {
    return this.role || (this.nav.roles ? "tabpanel" : undefined);
  }

  @HostBinding("attr.aria-labelledby")
  get _ariaLabelledBy(): string {
    return this.item.domId;
  }
}
