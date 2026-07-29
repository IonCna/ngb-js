import type { NgbScrollSpyMenu } from "@ngb/scrollspy/ngb-scrollSpy-menu.directive";
import type { NgbScrollSpy } from "@ngb/scrollspy/ngb-scrollspy.directive";
import { NgbScrollSpyService, type NgbScrollToOptions } from "@ngb/scrollspy/scrollspy.service";
import type { IAugmentedJQuery, IController, IDirective } from "angular";
import angular from "angular";
import type { Subscription } from "rxjs";

type NgbScrollSpyItemData = NgbScrollSpy | string | [NgbScrollSpy, string, string?];

export class NgbScrollSpyItem implements IController {
  private _isActive = false;
  private _scrollSpyAPI!: NgbScrollSpy | NgbScrollSpyMenu | NgbScrollSpyService;
  private _activeSubscription?: Subscription;
  private _clickListener?: () => void;

  public fragment!: string;
  public parent?: string;
  public data?: NgbScrollSpyItemData;
  public scrollSpy?: NgbScrollSpy;
  public parentScrollSpy?: NgbScrollSpy;
  public scrollSpyMenu?: NgbScrollSpyMenu;

  constructor(
    private $element: IAugmentedJQuery,
    private $scrollSpy: NgbScrollSpyService,
  ) {}

  $onInit(): void {
    this._scrollSpyAPI = this.scrollSpyMenu ?? this.scrollSpy ?? this.parentScrollSpy ?? this.$scrollSpy;
    this._applyData(this.data);
  }

  $postLink(): void {
    this.scrollSpyMenu?.register(this);

    // if it is not a part of a bigger menu, it should handle activation itself
    if (!this.scrollSpyMenu) {
      this._activeSubscription = this._scrollSpyAPI.active$.subscribe((active: string) => {
        if (active === this.fragment) {
          this._activate();
        } else {
          this._deactivate();
        }
      });
    }

    this._clickListener = () => this.scrollTo();
    this.$element.on("click", this._clickListener);
    this._applyHostBindings();
  }

  $onChanges(): void {
    this._applyData(this.data);
    this._applyHostBindings();
  }

  $onDestroy(): void {
    if (this._clickListener) {
      this.$element.off("click", this._clickListener);
    }

    this._activeSubscription?.unsubscribe();
    this.scrollSpyMenu?.unregister(this);
  }

  /**
   * @internal
   */
  _activate(): void {
    this._isActive = true;
    this._applyHostBindings();
    this.scrollSpyMenu?.getItem(this.parent ?? "")?._activate();
  }

  /**
   * @internal
   */
  _deactivate(): void {
    this._isActive = false;
    this._applyHostBindings();
    this.scrollSpyMenu?.getItem(this.parent ?? "")?._deactivate();
  }

  /**
   * Returns `true`, if the associated fragment is active.
   */
  isActive(): boolean {
    return this._isActive;
  }

  /**
   * Scrolls to the associated fragment.
   */
  scrollTo(options?: NgbScrollToOptions): void {
    this._scrollSpyAPI.scrollTo(this.fragment, options);
  }

  private _applyData(data?: NgbScrollSpyItemData): void {
    if (this.scrollSpy) {
      this._scrollSpyAPI = this.scrollSpy;
    }

    if (Array.isArray(data)) {
      this._scrollSpyAPI = data[0];
      this.fragment = data[1];
      this.parent ??= data[2];
      return;
    }

    if (angular.isString(data)) {
      this.fragment = data;
      return;
    }

    if (data) {
      this._scrollSpyAPI = data;
    }
  }

  private _applyHostBindings(): void {
    this.$element.toggleClass("active", this.isActive());
  }

  //#region $angular

  static get $name() {
    return "ngbScrollSpyItem";
  }

  static get $factory(): () => IDirective {
    return () => ({
      bindToController: {
        data: "@?ngbScrollSpyItem",
        fragment: "@?",
        parent: "@?",
        scrollSpy: "<?",
      },
      controller: NgbScrollSpyItem,
      require: {
        parentScrollSpy: "?^ngbScrollSpy",
        scrollSpyMenu: "?^ngbScrollSpyMenu",
      },
      scope: true,
      restrict: "A",
    });
  }

  static get $inject() {
    return ["$element", NgbScrollSpyService.$name];
  }

  //#endregion
}
