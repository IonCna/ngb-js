import type { NgbNavChangeEvent } from "@ngb/nav/ngb-nav-config.service";
import { NgbNavConfig } from "@ngb/nav/ngb-nav-config.service";
import type { NgbNavItem } from "@ngb/nav/ngb-nav-item.directive";
import type { NgbNavLink } from "@ngb/nav/ngb-nav-link.directive";
import { type INgbEvent, toNativeElement } from "@ngb/utils";
import type {
  IAttributes,
  IAugmentedJQuery,
  IController,
  IDeferred,
  IDirective,
  IDocumentService,
  IOnChangesObject,
  IPromise,
  IQService,
  IScope,
} from "angular";
import angular from "angular";

const isValidNavId = (id?: string | null): id is string => angular.isDefined(id) && id !== "";

export class NgbNav implements IController {
  static readonly ngAcceptInputType_orientation: string;
  static readonly ngAcceptInputType_roles: boolean | string;

  public _navigatingWithKeyboard = false;

  public activeId?: string;
  public animation?: boolean;
  public destroyOnHide?: boolean;
  public orientation?: "vertical" | "horizontal";
  public roles?: false | "tablist";
  public keyboard?: boolean | "changeWithArrows";
  public role?: string;

  public activeIdChange?: (event: INgbEvent<string>) => void;
  public shown?: () => void;
  public hidden?: () => void;
  public navChange?: (event: INgbEvent<NgbNavChangeEvent>) => void;

  private items: NgbNavItem[] = [];
  private links: NgbNavLink[] = [];

  public navItemChange?: IPromise<NgbNavItem>;
  private navItemDefer?: IDeferred<NgbNavItem>;

  constructor(
    private $config: NgbNavConfig,
    private $document: IDocumentService,
    private $element: IAugmentedJQuery,
    private $attributes: IAttributes,
    private $q: IQService,
    private $scope: IScope,
  ) {}

  $onInit(): void {
    this.animation = this.animation ?? this.$config.animation;
    this.$attributes.$observe<string>("role", (role) => {
      this.role = role;
      this.refresh();
    });

    this.navItemDefer = this.$q.defer<NgbNavItem>();
    this.navItemChange = this.navItemDefer.promise;
  }

  $postLink(): void {
    this.$element.addClass("nav");

    this.$element.on("keydown", this.onKeyDown.bind(this));
    this.$element.on("focusout", this.onFocusout.bind(this));

    this.$scope.$evalAsync(() => {
      if (!angular.isDefined(this.activeId)) {
        const [first] = this.items;
        const nextId = first ? first.id : null;

        if (isValidNavId(nextId)) {
          this._updateActiveId(nextId, false);
        }
      }
    });

    this.$scope.$watchCollection(
      () => this.items,
      () => {
        if (!this.activeId) return;
        this._notifyItemChanged(this.activeId);
      },
    );
  }

  public select(id: string) {
    this._updateActiveId(id, false);
  }

  $onChanges(changes: IOnChangesObject): void {
    this.refresh();

    if (changes.activeId && !changes.activeId.isFirstChange()) {
      this._notifyItemChanged(changes.activeId.currentValue);
    }
  }

  private refresh() {
    this.$element.toggleClass("flex-column", this.orientation === "vertical");

    const isVertical = this.orientation === "vertical" && this.roles === "tablist";

    if (isVertical) {
      this.$element.attr("aria-orientation", "vertical");
    } else this.$element.removeAttr("aria-orientation");

    const role = this.role || (this.roles ? "tablist" : undefined);

    if (role) this.$element.attr("role", role);
    else this.$element.removeAttr("role");
  }

  $onDestroy(): void {
    this.$element.off("keydown");
    this.$element.off("focusout");

    this.items = [];
    this.links = [];
  }

  public registerItems(item: NgbNavItem) {
    this.items.push(item);
  }

  public unregisterItem(item: NgbNavItem) {
    this.items = this.items.filter((i) => i !== item);
  }

  public registerLinks(link: NgbNavLink) {
    this.links.push(link);
  }

  public unregisterLink(link: NgbNavLink) {
    this.links = this.links.filter((l) => l !== link);
  }

  public onKeyDown(event: JQueryEventObject) {
    if (this.roles !== "tablist" || !this.keyboard) {
      return;
    }

    const enabledLinks = this.links.filter((link) => !link.ngbNavItem.disabled);
    const { length } = enabledLinks;
    let position = -1;

    enabledLinks.forEach((link, index) => {
      if (link.nativeElement === toNativeElement<Document>(this.$document).activeElement) {
        position = index;
      }
    });

    const toStart = () => {
      position = 0;
    };

    const toEnd = () => {
      position = length - 1;
    };

    const toDecrease = () => {
      position = (position - 1 + length) % length;
    };

    const toIncrease = () => {
      position = (position + 1) % length;
    };

    const cases: Record<string, () => void> = {
      ArrowUp: toDecrease,
      ArrowLeft: toDecrease,
      ArrowRight: toIncrease,
      ArrowDown: toIncrease,
      Home: toStart,
      End: toEnd,
    };

    if (!length) return;

    const action = cases[event.key];
    if (!action) return;

    action();

    if (this.keyboard === "changeWithArrows") {
      this.select(enabledLinks[position].ngbNavItem.id);
    }

    enabledLinks[position].nativeElement.focus();
    this._navigatingWithKeyboard = true;

    event.preventDefault();
  }

  public click(item: NgbNavItem) {
    if (!item.disabled) {
      this._updateActiveId(item.id);
    }
  }

  public onFocusout(event: JQueryEventObject) {
    if (!toNativeElement(this.$element).contains(event.relatedTarget as Node | null)) {
      this._navigatingWithKeyboard = false;
    }
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
    this.navItemDefer?.notify(this._getItemById(nextItemId));
  }

  private _getItemById(itemId: string): NgbNavItem | null {
    return this.items?.find((item) => item.id === itemId) || null;
  }

  //#region $angular

  static get $name() {
    return "ngbNav";
  }

  static get $inject() {
    return [NgbNavConfig.$name, "$document", "$element", "$attrs", "$q", "$scope"];
  }

  static get $factory(): () => IDirective {
    return () => ({
      restrict: "A",
      scope: {
        activeId: "@?",
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
