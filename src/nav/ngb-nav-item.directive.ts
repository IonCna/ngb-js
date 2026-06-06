import type { NgbNav } from "@ngb/nav/ngb-nav.directive";
import type { NgbNavContent } from "@ngb/nav/ngb-nav-content.directive";
import { toNativeElement } from "@ngb/utils";
import type { IAugmentedJQuery, IController, IDirective } from "angular";
import angular from "angular";

const isValidNavId = (id?: string): id is string => angular.isDefined(id) && id !== "";
let navCounter = 0;

export class NgbNavItem implements IController {
  private _nav!: NgbNav;
  public destroyOnHide?: boolean;
  public disabled!: boolean;
  public domId!: string;
  public shown?: () => void;
  public hidden?: () => void;

  private _id?: string;
  private _content?: NgbNavContent;

  constructor(private $element: IAugmentedJQuery) {}

  $onInit(): void {
    this.disabled = this.disabled ?? false;

    if (!angular.isDefined(this.domId)) {
      this.domId = `ngb-nav-${navCounter++}`;
    }
  }

  $postLink(): void {
    this.$element.addClass("nav-item");
    this._nav.registerItems(this);
  }

  $onDestroy(): void {
    this._nav.unregisterItem(this);
  }

  get active() {
    return this._nav.activeId === this.id;
  }

  get id() {
    return isValidNavId(this._id) ? this._id : this.domId;
  }

  get panelDomId() {
    return `${this.domId}-panel`;
  }

  get contentTpl(): NgbNavContent | undefined {
    return this._content;
  }

  public isPanelInDom() {
    return angular.isDefined(this.destroyOnHide) ? !this.destroyOnHide : !this._nav.destroyOnHide || this.active;
  }

  public isNgContainer() {
    return toNativeElement(this.$element).nodeType === Node.COMMENT_NODE;
  }

  public register(content: NgbNavContent) {
    if (this._content) {
      throw new Error("only one content in item are allowed");
    }
    this._content = content;
  }

  //#region $angular

  static get $inject() {
    return ["$element"];
  }

  static get $name() {
    return "ngbNavItem";
  }

  static get $factory(): () => IDirective {
    return () => ({
      controller: NgbNavItem,
      restrict: "A",
      bindToController: true,
      require: {
        _nav: "^ngbNav",
      },
      scope: {
        destroyOnHide: "<?",
        disabled: "<?",
        domId: "@?",
        _id: "@?ngbNavItem",
        shown: "&?",
        hidden: "&?",
      },
    });
  }

  //#endregion
}
