import { NgbNav } from "@ngb/nav/ngb-nav.directive";
import { NgbNavContent } from "@ngb/nav/ngb-nav-content.directive";
import {
  ContentChild,
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  inject,
  Input,
  type OnInit,
  Output,
  TemplateRef,
} from "ngjs-core";

// biome-ignore lint/suspicious/noExplicitAny: los ids de nav aceptan cualquier tipo en ng-bootstrap
const isValidNavId = (id: any): boolean => id !== undefined && id !== null && id !== "";
let navCounter = 0;

@Directive({
  selector: "[ngbNavItem]",
  exportAs: "ngbNavItem",
})
export class NgbNavItem implements OnInit {
  private _nav = inject(NgbNav);
  private _nativeElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  @Input() destroyOnHide?: boolean;
  @Input() disabled = false;
  @Input() domId!: string;
  // biome-ignore lint/suspicious/noExplicitAny: API pública compatible con ng-bootstrap
  @Input("ngbNavItem") _id: any;

  @Output() shown = new EventEmitter<void>();
  @Output() hidden = new EventEmitter<void>();

  @ContentChild(NgbNavContent, { descendants: false, read: TemplateRef })
  contentTpl?: TemplateRef<{ $implicit: boolean }>;

  @HostBinding("class.nav-item")
  readonly _navItemClass = true;

  ngOnInit(): void {
    if (this.domId === undefined || this.domId === null) {
      this.domId = `ngb-nav-${navCounter++}`;
    }
  }

  get active(): boolean {
    return this._nav.activeId === this.id;
  }

  // biome-ignore lint/suspicious/noExplicitAny: API pública compatible con ng-bootstrap
  get id(): any {
    return isValidNavId(this._id) ? this._id : this.domId;
  }

  get panelDomId(): string {
    return `${this.domId}-panel`;
  }

  isPanelInDom(): boolean {
    return (this.destroyOnHide !== undefined ? !this.destroyOnHide : !this._nav.destroyOnHide) || this.active;
  }

  isNgContainer(): boolean {
    return this._nativeElement.nodeType === Node.COMMENT_NODE;
  }
}
