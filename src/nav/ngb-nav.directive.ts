import { NgbNavConfig, type NgbNavChangeEvent } from "@ngb/nav/ngb-nav-config.service";
import type { NgbNavItem } from "@ngb/nav/ngb-nav-item.directive";
import type { NgbNavLinkBase } from "@ngb/nav/ngb-nav-link-base.directive";
import { assertAttribute, type INgbEvent, toNativeElement } from "@ngb/utils";
import type {
  IAttributes,
  IAugmentedJQuery,
  IController,
  IDirective,
  IDocumentService,
  IOnChangesObject,
  IScope,
} from "angular";
import angular, { isDefined } from "angular";
import { Subject } from "rxjs";

const isValidNavId = (id?: string | null): id is string => angular.isDefined(id) && id !== "";

export class NgbNav implements IController {
  static readonly ngAcceptInputType_orientation: string;
  static readonly ngAcceptInputType_roles: boolean | string;

  public _navigatingWithKeyboard = false;

  public activeId!: string;
  public activeIdChange?: (event: INgbEvent<string>) => void;
  public animation?: boolean;
  public destroyOnHide?: boolean;
  public orientation?: "vertical" | "horizontal";
  public roles?: false | "tablist";
  public keyboard?: boolean | "changeWithArrows";
  public shown?: (event: INgbEvent<unknown>) => void;
  public hidden?: (event: INgbEvent<unknown>) => void;

  public role?: string;

  public navChange?: (event: INgbEvent<NgbNavChangeEvent>) => void;

  public items: NgbNavItem[] = [];
  private links: NgbNavLinkBase[] = [];

  public navItemChange$ = new Subject<NgbNavItem | null>();
  private itemsChange$ = new Subject<void>();

  constructor(
    private $document: IDocumentService,
    private $element: IAugmentedJQuery,
    private $attributes: IAttributes,
    private $scope: IScope,
    private config: NgbNavConfig,
  ) {}

  $onInit(): void {
    this.animation ??= this.config.animation;
    this.destroyOnHide ??= this.config.destroyOnHide;
    this.keyboard ??= this.config.keyboard;
    this.orientation ??= this.config.orientation;
    this.roles ??= this.config.roles;
  }

  $postLink(): void {
    this.$element.addClass("nav");

    this.$element.on("keydown", this.onKeyDown.bind(this));
    this.$element.on("focusout", this.onFocusout.bind(this));

    const navRef = this.$attributes.navRef;
    if (navRef) (this.$scope.$parent as unknown as Record<string, unknown>)[navRef] = this;

    this.$attributes.$observe("role", (role?: string) => {
      this.role = role;
      assertAttribute(this.$element, "role", this.role ? this.role : this.roles ? "tablist" : undefined);
    });

    if (!isDefined(this.activeId)) {
      const [first] = this.items;
      const nextId = first ? first.id : null;

      if (isValidNavId(nextId)) {
        this.$scope.$applyAsync(() => this._updateActiveId(nextId, false));
      }
    }

    this.itemsChange$.subscribe(() => this._notifyItemChanged(this.activeId));
  }

  $onChanges(changes: IOnChangesObject): void {
    this.$element.toggleClass("flex-column", this.orientation === "vertical");
    assertAttribute(
      this.$element,
      "aria-orientation",
      this.orientation === "vertical" && this.roles === "tablist" ? "vertical" : undefined,
    );

    if (changes.activeId && !changes.activeId.isFirstChange()) {
      this._notifyItemChanged(changes.activeId.currentValue);
    }
  }

  $onDestroy(): void {
    this.navItemChange$.complete();
    this.itemsChange$.complete();

    this.$element.off("keydown");
    this.$element.off("focusout");
  }

  public registerItems(item: NgbNavItem) {
    this.items.push(item);
    this.itemsChange$.next();
  }

  public registerLinks(link: NgbNavLinkBase) {
    this.links.push(link);
  }

  public unregisterLink(link: NgbNavLinkBase) {
    const index = this.links.indexOf(link);
    if (index >= 0) this.links.splice(index, 1);
  }

  public unregisterItem(item: NgbNavItem) {
    const index = this.items.indexOf(item);
    this.items.splice(index, 1);

    this.itemsChange$.next();
  }

  public onKeyDown(event: JQueryEventObject) {
    if (this.roles !== "tablist" || !this.keyboard) {
      return;
    }

    const enabledLinks = this.links.filter((link) => !link.ngbNavItem.disabled);
    const { length } = enabledLinks;

    let position = -1;
    const doc = toNativeElement<Document>(this.$document);

    enabledLinks.forEach((link, index) => {
      if (link.nativeElement === doc.activeElement) {
        position = index;
      }
    });

    if (!length) return;

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
    }

    if (this.keyboard === "changeWithArrows") {
      this.select(enabledLinks[position].ngbNavItem.id);
    }

    enabledLinks[position].nativeElement.focus();
    this._navigatingWithKeyboard = true;

    event.preventDefault();
  }

  public onFocusout({ relatedTarget }: JQueryEventObject) {
    const native = toNativeElement(this.$element);

    if (!native.contains(relatedTarget as HTMLElement)) {
      this._navigatingWithKeyboard = false;
    }
  }

  public click(item: NgbNavItem) {
    if (!item.disabled) {
      this._updateActiveId(item.id);
    }
  }

  public select(id: string) {
    this._updateActiveId(id, false);
  }

  private _updateActiveId(nextId: string, emitNavChange = true) {
    if (this.activeId === nextId) return;

    let defaultPrevented = false;

    if (emitNavChange) {
      this.navChange?.({
        $event: {
          activeId: this.activeId,
          nextId,
          preventDefault: () => {
            defaultPrevented = true;
          },
        },
      });
    }

    if (!defaultPrevented) {
      this.activeId = nextId;
      this.activeIdChange?.({ $event: nextId });
      this._notifyItemChanged(nextId);
    }
  }

  private _notifyItemChanged(nextItemId: string) {
    this.navItemChange$.next(this._getItemById(nextItemId));
  }

  private _getItemById(itemId: string): NgbNavItem | null {
    return this.items?.find((item) => item.id === itemId) || null;
  }

  //#region $angular

  static get $name() {
    return "ngbNav";
  }

  static get $inject() {
    return ["$document", "$element", "$attrs", "$scope", NgbNavConfig.$name];
  }

  static get $factory(): () => IDirective {
    return () => ({
      restrict: "A",
      scope: {
        activeId: "=?",
        animation: "<?",
        destroyOnHide: "<?",
        keyboard: "<?",
        orientation: "<?",
        roles: "<?",
        activeIdChange: "&?",
        hidden: "&?",
        navChange: "&?",
        shown: "&?",
      },
      bindToController: true,
      controller: NgbNav,
    });
  }

  //#endregion
}
