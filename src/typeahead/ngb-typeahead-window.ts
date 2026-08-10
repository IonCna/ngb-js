import template from "@ngb/typeahead/ngb-typeahead-window.html";
import { toString } from "@ngb/utils";
import type { IAugmentedJQuery, IComponentController, IComponentOptions, IOnChangesObject } from "angular";
import type { TemplateRef } from "ngjs-core";
import type { ResultTemplateContext } from "@ngb/typeahead/ngb-result-template-context.model.ts";

export class NgbTypeaheadWindow implements IComponentController {
  activeIdx = 0;
  focusFirst!: boolean;
  results: unknown[] = [];
  term?: string;
  formatter!: (result: unknown) => string;
  resultTemplate?: TemplateRef<ResultTemplateContext>;
  popupClass?: string;
  selectEvent?: ({ $event }: { $event: any }) => void;
  activeChangeEvent?: ({ $event }: { $event: any }) => void;

  constructor(private readonly $element: IAugmentedJQuery) {}

  set id(value: string | undefined) {
    if (value) {
      this.$element.attr("id", value);
      return;
    }

    this.$element.removeAttr("id");
  }

  get id(): string {
    return this.$element.attr("id") ?? "";
  }

  $onInit() {
    this.focusFirst = this.focusFirst ?? true;
    this.formatter = this.formatter ?? toString;

    this.resetActive();
  }

  $postLink() {
    this.$element.addClass("dropdown-menu show");
    this.$element.attr("role", "listbox");
    this.$element.on("mousedown", this.preventMouseDownDefault);
  }

  $onChanges(changes: IOnChangesObject) {
    const previousPopupClass = changes.popupClass?.previousValue;
    if (typeof previousPopupClass === "string" && previousPopupClass) {
      this.$element.removeClass(previousPopupClass);
    }

    if (this.popupClass) {
      this.$element.addClass(this.popupClass);
    }
  }

  $onDestroy() {
    this.$element.off("mousedown", this.preventMouseDownDefault);
  }

  public hasActive() {
    return this.activeIdx > -1 && this.activeIdx < this.results.length;
  }

  public getActive() {
    return this.results[this.activeIdx];
  }

  public markActive(activeIdx: number) {
    this.activeIdx = activeIdx;
    this._activeChanged();
  }

  public next() {
    if (this.activeIdx !== this.results.length - 1) {
      this.activeIdx++;
      this._activeChanged();
      return;
    }

    this.activeIdx = this.focusFirst ? (this.activeIdx + 1) % this.results.length : -1;
    this._activeChanged();
  }

  public prev() {
    if (this.activeIdx === 0) {
      this.activeIdx = this.focusFirst ? this.results.length - 1 : -1;
      this._activeChanged();
      return;
    }

    if (this.activeIdx > 0) {
      this.activeIdx--;
      this._activeChanged();
      return;
    }

    this.activeIdx = this.results.length - 1;
    this._activeChanged();
  }

  public resetActive() {
    this.activeIdx = this.focusFirst ? 0 : -1;
    this._activeChanged();
  }

  public select(item: unknown) {
    this.selectEvent?.({ $event: item });
  }

  private _activeChanged() {
    this.activeChangeEvent?.({
      $event: this.activeIdx >= 0 ? this.id + "-" + this.activeIdx : undefined,
    });
  }

  private readonly preventMouseDownDefault = (event: JQueryEventObject) => event.preventDefault();

  static get $name() {
    return "ngbTypeaheadWindow";
  }

  static get $factory(): IComponentOptions {
    return {
      controller: NgbTypeaheadWindow,
      controllerAs: "$",
      bindings: {
        focusFirst: "<?",
        results: "<?",
        term: "<?",
        formatter: "<?",
        resultTemplate: "<?",
        popupClass: "<?",
        selectEvent: "&?select",
        activeChangeEvent: "&?activeChange",
      },
      template,
    };
  }

  static get $inject() {
    return ["$element"];
  }
}
