import type { NgbAccordion } from "@ngb/accordion/ngb-accordion.directive";
import type { IAugmentedJQuery, IController, IDirective } from "angular";
import angular from "angular";
import { ContentChild, NgDisabled } from "ngjs-core";
import type { Subscription } from "rxjs";
import { NgbAccordionBody } from "./ngb-accordion-body.directive";
import { NgbAccordionCollapse } from "./ngb-accordion-collapse.directive";

let accordionItemCounter = 0;

export class NgbAccordionItem implements IController {
  private readonly _accordion!: NgbAccordion;
  private _collapsed = true;
  private _destroyOnHide: boolean | undefined;

  private _collapseAnimationRunning = false;
  private _collapseHiddenSubscription?: Subscription;
  private _collapseShownSubscription?: Subscription;
  private _id!: string;

  public hidden?: () => void;
  public hide?: () => void;
  public show?: () => void;
  public shown?: () => void;

  public ngDisabled?: NgDisabled;

  @ContentChild(NgbAccordionCollapse, { static: true })
  private _collapse!: NgbAccordionCollapse;

  @ContentChild(NgbAccordionBody, { static: true })
  private _body?: NgbAccordionBody;

  constructor(private readonly $element: IAugmentedJQuery) {}

  $postLink(): void {
    this._id = this._id ?? `ngb-accordion-item-${accordionItemCounter++}`;

    this.$element.attr("id", this._id);
    this.$element.addClass("accordion-item");

    const { ngbCollapse } = this._collapse;

    ngbCollapse.animation = false;
    ngbCollapse.collapsed = this.collapsed;
    ngbCollapse.animation = this._accordion.animation;

    this._collapseHiddenSubscription = ngbCollapse.hidden.subscribe(() => this.onCollapseHidden());
    this._collapseShownSubscription = ngbCollapse.shown.subscribe(() => this.onCollapseShown());
  }

  $onDestroy(): void {
    this._collapseHiddenSubscription?.unsubscribe();
    this._collapseShownSubscription?.unsubscribe();
  }

  set id(id: string) {
    if (!angular.isString(id) || id === "") return;
    this._id = id;
  }

  set destroyOnHide(destroyOnHide: boolean) {
    this._destroyOnHide = destroyOnHide;
  }

  get destroyOnHide() {
    return angular.isUndefined(this._destroyOnHide)
      ? Boolean(this._accordion.destroyOnHide)
      : Boolean(this._destroyOnHide);
  }

  set collapsed(collapsed: boolean) {
    if (collapsed === undefined) return;

    if (!this._accordion) {
      this._collapsed = collapsed;
      return;
    }

    if (collapsed) {
      this.collapse();
      return;
    }

    this.expand();
  }

  get collapsed() {
    return this._collapsed;
  }

  get id() {
    return `${this._id}`;
  }

  get toggleId() {
    return `${this.id}-toggle`;
  }

  get collapseId() {
    return `${this.id}-collapse`;
  }

  get _shouldBeInDOM() {
    return !this.collapsed || this._collapseAnimationRunning || !this.destroyOnHide;
  }

  isDisabled(): boolean {
    return this.ngDisabled?.disabled ?? false;
  }

  toggle() {
    this.collapsed = !this.collapsed;
  }

  onCollapseHidden() {
    this._collapseAnimationRunning = false;
    this.hidden?.();
    this._accordion.hidden?.({ $event: this.id });
  }

  onCollapseShown() {
    this.shown?.();
    this._accordion.shown?.({ $event: this.id });
  }

  expand() {
    if (!this.collapsed) return;

    // checking if accordion allows to expand the panel in respect to 'closeOthers' flag
    if (!this._accordion._ensureCanExpand(this)) {
      return;
    }

    this._collapsed = false;
    this._body?.detectChanges();

    // firing events before starting animations
    this.show?.();
    this._accordion.show?.({ $event: this.id });

    // we also need to make sure 'animation' flag is up-to- date
    this._collapse.ngbCollapse.animation = this._accordion.animation;
    this._collapse.ngbCollapse.collapsed = false;
  }

  collapse() {
    if (this.collapsed) return;
    this._collapsed = true;
    this._collapseAnimationRunning = true;

    // need if the accordion is used inside a component having OnPush change detection strategy
    //this._cd.markForCheck();

    // firing events before starting animations
    this.hide?.();
    this._accordion.hide?.({ $event: this.id });

    // we also need to make sure 'animation' flag is up-to- date
    this._collapse.ngbCollapse.animation = this._accordion.animation;
    this._collapse.ngbCollapse.collapsed = true;
  }

  static get $inject() {
    return ["$element"];
  }

  static get $name() {
    return "ngbAccordionItem";
  }

  static get $factory(): () => IDirective {
    return () => ({
      bindToController: true,
      controller: NgbAccordionItem,
      require: {
        _accordion: "^ngbAccordion",
        ngDisabled: "?ngDisabled",
      },
      restrict: "A",
      transclude: true,
      template: "<ng-content></ng-content>",
      scope: {
        collapsed: "<?",
        destroyOnHide: "<?",
        id: "<?ngbAccordionItem",
        hidden: "&?",
        hide: "&?",
        show: "&?",
        shown: "&?",
      },
    });
  }
}
