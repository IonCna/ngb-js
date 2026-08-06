import type { NgbNav } from "@ngb/nav/ngb-nav.directive";
import { NgbNavContent } from "@ngb/nav/ngb-nav-content.directive";
import { toNativeElement } from "@ngb/utils";
import type { IAugmentedJQuery, IController, IDirective } from "angular";
import angular from "angular";
import { ContentChild, TemplateRef } from "ngjs-core";

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
  @ContentChild(NgbNavContent, { descendants: false, read: TemplateRef })
  public contentTpl?: TemplateRef<{ $implicit: boolean }>;

  constructor(private $element: IAugmentedJQuery) {}

  $onInit(): void {
    this.disabled = this.disabled ?? false;

    if (!angular.isDefined(this.domId)) {
      this.domId = `ngb-nav-${navCounter++}`;
    }
  }

  $postLink(): void {
    this.$element.addClass("nav-item");
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

  public isPanelInDom() {
    return angular.isDefined(this.destroyOnHide) ? !this.destroyOnHide : !this._nav.destroyOnHide || this.active;
  }

  public isNgContainer() {
    return toNativeElement(this.$element).nodeType === Node.COMMENT_NODE;
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
      transclude: true,
      template: "<ng-content></ng-content>",
    });
  }

  //#endregion
}
