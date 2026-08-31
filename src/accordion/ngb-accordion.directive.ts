import { NgbAccordionConfig } from "@ngb/accordion/ngb-accordion-config.service";
import { NgbAccordionItem } from "@ngb/accordion/ngb-accordion-item.directive";
import type { INgbEvent } from "@ngb/utils";
import type { IAugmentedJQuery, IController, IDirective } from "angular";
import { ContentChildren, type QueryList } from "ngjs-core";

export interface INgbAccordion {
  toggle(itemId: string): void;
  expand(itemId: string): void;
  collapse(itemId: string): void;
  isExpanded(itemId: string): void;

  expandAll(): void;
  collapseAll(): void;
}

export class NgbAccordion implements IController, INgbAccordion {
  private _anItemWasAlreadyExpandedDuringInitialization = false;

  @ContentChildren(NgbAccordionItem, { descendants: false })
  private _items!: QueryList<NgbAccordionItem>;

  public animation!: boolean;
  public closeOthers!: boolean;
  public destroyOnHide!: boolean;

  public show?: ({ $event }: INgbEvent<string>) => void;
  public shown?: ({ $event }: INgbEvent<string>) => void;

  public hidden?: ({ $event }: INgbEvent<string>) => void;
  public hide?: ({ $event }: INgbEvent<string>) => void;

  constructor(
    private readonly $element: IAugmentedJQuery,
    private readonly ngbAccordionConfig: NgbAccordionConfig,
  ) {}

  $onInit(): void {
    this.animation = this.animation ?? this.ngbAccordionConfig.animation;
    this.closeOthers = this.closeOthers ?? this.ngbAccordionConfig.closeOthers;
    this.destroyOnHide = this.destroyOnHide ?? this.ngbAccordionConfig.destroyOnHide;
  }

  $postLink(): void {
    this.$element.addClass("accordion");
  }

  public toggle(itemId: string) {
    this._getItem(itemId)?.toggle();
  }

  public expand(itemId: string) {
    this._getItem(itemId)?.expand();
  }

  public expandAll() {
    if (!this.closeOthers) {
      this._items.forEach((item) => {
        item.expand();
      });
      return;
    }

    const item = this._items.find((item) => !item.collapsed);

    if (!item) {
      this._items.first?.expand();
    }
  }

  public collapse(itemId: string) {
    this._getItem(itemId)?.collapse();
  }

  public collapseAll() {
    this._items.forEach((item) => {
      item.collapse();
    });
  }

  public isExpanded(itemId: string) {
    const item = this._getItem(itemId);
    return item ? !item.collapsed : false;
  }

  public _ensureCanExpand(toExpand: NgbAccordionItem) {
    if (!this.closeOthers) return true;

    if (this._items.length === 0) {
      if (!this._anItemWasAlreadyExpandedDuringInitialization) {
        this._anItemWasAlreadyExpandedDuringInitialization = true;
        return true;
      }

      return false;
    }

    this._items.find((item) => !item.collapsed && toExpand !== item)?.collapse();
    return true;
  }

  private _getItem(itemId: string): NgbAccordionItem | undefined {
    return this._items.find((item) => item.id === itemId);
  }

  static get $name() {
    return "ngbAccordion";
  }

  static get $factory(): () => IDirective {
    return () => ({
      bindToController: true,
      controller: NgbAccordion,
      restrict: "A",
      transclude: true,
      template: "<ng-content></ng-content>",
      scope: {
        animation: "<?",
        closeOthers: "<?",
        destroyOnHide: "<?",
        hidden: "&?",
        hide: "&?",
        show: "&?",
        shown: "&?",
      },
    });
  }

  static get $inject() {
    return ["$element", NgbAccordionConfig.$name];
  }
}
