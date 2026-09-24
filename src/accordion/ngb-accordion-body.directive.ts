import { NgbAccordionItem } from "@ngb/accordion/ngb-accordion-item.directive";
import {
  ContentChild,
  ElementRef,
  type EmbeddedViewRef,
  Directive,
  HostBinding,
  inject,
  type OnDestroy,
  TemplateRef,
  ViewContainerRef,
} from "ngjs-core";

/**
 * Envuelve el contenido del cuerpo colapsable de un item del acordeón.
 *
 * El contenido real va en un `<ng-template>` hijo — según el estado del
 * acordeón, se inserta o se quita del DOM.
 *
 * Patrón 1:1 con ng-bootstrap v20: `template: "<ng-container #container />
 * <ng-content />"` + `@ViewChild("container", { read: ViewContainerRef })` —
 * el `ViewContainerRef` ancla en el `<ng-container>` (adentro del propio
 * template de este componente), así la vista embebida queda dentro de
 * `.accordion-body`.
 *
 * @since 14.1.0
 */
@Directive({
  selector: "[ngbAccordionBody]",
})
export class NgbAccordionBody implements OnDestroy {
  private _vcr = inject(ViewContainerRef);
  private _element = inject(ElementRef<HTMLElement>).nativeElement;
  private _item = inject(NgbAccordionItem);
  private _viewRef: EmbeddedViewRef<unknown> | null = null;

  @HostBinding("class.accordion-body")
  readonly _hostClass = true;

  @ContentChild(TemplateRef, { static: true })
  private _bodyTpl!: TemplateRef<unknown>;

  ngAfterContentChecked(): void {
    if (this._bodyTpl) {
      if (this._item._shouldBeInDOM) {
        this._createViewIfNotExists();
      } else {
        this._destroyViewIfExists();
      }
    }
  }

  ngOnDestroy(): void {
    this._destroyViewIfExists();
  }

  private _destroyViewIfExists(): void {
    this._viewRef?.destroy();
    this._viewRef = null;
  }

  private _createViewIfNotExists(): void {
    if (!this._viewRef) {
      this._viewRef = this._vcr.createEmbeddedView(this._bodyTpl);
      this._viewRef.detectChanges();
      for (const node of this._viewRef.rootNodes) {
        this._element.appendChild(node);
      }
    }
  }
}
