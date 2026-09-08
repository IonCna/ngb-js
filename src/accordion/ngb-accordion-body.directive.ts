import { NgbAccordionItem } from "@ngb/accordion/ngb-accordion-item.directive";
import {
  Component,
  ContentChild,
  ElementRef,
  type EmbeddedViewRef,
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
 * ng-bootstrap v20 usa `template: "<ng-container #container /><ng-content />"` +
 * `@ViewChild("container", { read: ViewContainerRef })`. `ngjs-core` no resuelve
 * `@ViewChild(nombre, { read: ViewContainerRef })` sobre un ancla que no es un
 * componente (ver CORE_GAPS), así que acá se usa el `ViewContainerRef` del
 * propio host (`inject(ViewContainerRef)`) — mismo efecto: la vista embebida
 * queda dentro del `.accordion-body`.
 *
 * @since 14.1.0
 */
@Component({
  selector: "[ngbAccordionBody]",
  template: `<ng-content></ng-content>`,
})
export class NgbAccordionBody implements OnDestroy {
  private _item = inject(NgbAccordionItem);
  private _viewRef: EmbeddedViewRef<unknown> | null = null;

  /** El `ElementRef` del componente. @since 18.0.0 */
  readonly elementRef = inject(ElementRef);

  @HostBinding("class.accordion-body")
  readonly _hostClass = true;

  private _vcr = inject(ViewContainerRef);

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
    }
  }
}
