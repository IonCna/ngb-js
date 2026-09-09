import { NgbNav } from "@ngb/nav/ngb-nav.directive";
import { NgbNavContent } from "@ngb/nav/ngb-nav-content.directive";
import {
  Attribute,
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
  @Input({ alias: "ngbNavItem", binding: "@" }) _id: any;

  @Output() shown = new EventEmitter<void>();
  @Output() hidden = new EventEmitter<void>();

  @ContentChild(NgbNavContent, { descendants: false, read: TemplateRef })
  contentTpl?: TemplateRef<{ $implicit: boolean }>;

  @HostBinding("class.nav-item")
  readonly _navItemClass = true;

  // ng-bootstrap separa esto en `NgbNavItemRole` (`selector: "[ngbNavItem]:not(ng-container)"`).
  // AngularJS no deja dos directivas con el mismo nombre y ambas con controller
  // (`$compile:multidir`), así que acá va integrado, con el mismo criterio
  // `:not(ng-container)` chequeado en runtime. Ver CORE_GAPS.md.
  constructor(@Attribute("role") private readonly _explicitRole?: string) {}

  @HostBinding("attr.role")
  get _role(): string | undefined {
    if (this._nativeElement.tagName === "NG-CONTAINER") return undefined;
    return this._explicitRole || (this._nav.roles ? "presentation" : undefined);
  }

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
