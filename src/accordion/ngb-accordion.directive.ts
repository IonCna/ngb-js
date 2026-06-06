import { NgbAccordionConfig } from "@ngb/accordion/ngb-accordion-config.service";
import type { NgbAccordionItem } from "@ngb/accordion/ngb-accordion-item.directive";
import type { INgbEvent } from "@ngb/utils";
import type { IAugmentedJQuery, IController, IDirective } from "angular";

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
  private _items: NgbAccordionItem[] = [];

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

  register(item: NgbAccordionItem) {
    if (!this._items.includes(item)) {
      this._items = [...this._items, item];
    }
  }

  unregister(item: NgbAccordionItem) {
    this._items = this._items.filter((registeredItem) => registeredItem !== item);
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
    if (!this._items) return;
    if (!this.closeOthers) {
      this._items.forEach((item) => {
        item.expand();
      });
      return;
    }

    const item = this._items.find((item) => !item.collapsed);

    if (!item) {
      const [first] = this._items;
      first.expand();
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

    if (!this._items) {
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
