import type { NgbAccordionItem } from "@ngb/accordion/ngb-accordion-item.directive";
import type { IAugmentedJQuery, IController, IDirective } from "angular";
import { ContentChild, type EmbeddedViewRef, TemplateRef, ViewContainerRef } from "ngjs-core";

export class NgbAccordionBody implements IController {
  protected item!: NgbAccordionItem;
  private _viewRef: EmbeddedViewRef<unknown> | null = null;

  @ContentChild(TemplateRef, { static: true })
  private _bodyTpl!: TemplateRef<unknown>;

  constructor(
    private readonly $element: IAugmentedJQuery,
    private readonly _vcr: ViewContainerRef,
  ) {}

  $postLink(): void {
    this.$element.addClass("accordion-body");
  }

  $doCheck() {
    this.detectChanges();
  }

  detectChanges() {
    if (!this._bodyTpl) return;

    if (this.item._shouldBeInDOM) {
      this._createViewIfNotExists();
      return;
    }

    this._destroyViewIfExists();
  }

  $onDestroy() {
    this._destroyViewIfExists();
  }

  private _destroyViewIfExists() {
    this._viewRef?.destroy();
    this._viewRef = null;
  }

  private _createViewIfNotExists() {
    if (this._viewRef) return;

    this._viewRef = this._vcr.createEmbeddedView(this._bodyTpl);
    this._viewRef.detectChanges();
  }

  static get $name() {
    return "ngbAccordionBody";
  }

  static get $inject() {
    return ["$element", ViewContainerRef.$name];
  }

  static get $factory(): () => IDirective {
    return () => ({
      controller: NgbAccordionBody,
      bindToController: true,
      controllerAs: "$",
      require: {
        item: "^^ngbAccordionItem",
      },
      scope: true,
      restrict: "A",
      transclude: true,
      template: `
        <ng-content></ng-content>
      `,
    });
  }
}
