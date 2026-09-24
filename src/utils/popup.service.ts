import { ngbRunTransition } from "@ngb/utils/transition/ngb-transition";
import {
  ApplicationRef,
  type ComponentRef,
  DOCUMENT,
  Injector,
  inject,
  NgZone,
  TemplateRef,
  type Type,
  ViewContainerRef,
  type ViewRef,
} from "ngjs-core";
import { type Observable, of } from "rxjs";
import { mergeMap, take, tap } from "rxjs/operators";

export class ContentRef {
  constructor(
    public nodes: Node[][],
    public viewRef?: ViewRef,
    public componentRef?: ComponentRef<any>,
  ) {}
}

export class PopupService<T> {
  private _windowRef: ComponentRef<T> | null = null;
  private _contentRef: ContentRef | null = null;

  private _document = inject(DOCUMENT);
  private _applicationRef = inject(ApplicationRef);
  private _injector = inject(Injector);
  private _viewContainerRef = inject(ViewContainerRef);
  private _ngZone = inject(NgZone);

  constructor(private _componentType: Type<T>) {}

  async open(
    content?: string | TemplateRef<any>,
    templateContext?: any,
    animation = false,
  ): Promise<{ windowRef: ComponentRef<T>; transition$: Observable<void> }> {
    if (!this._windowRef) {
      this._contentRef = this._getContentRef(content, templateContext);
      this._windowRef = await this._viewContainerRef.createComponent<T>(this._componentType, {
        injector: this._injector,
        projectableNodes: this._contentRef.nodes,
      });
    }

    const { nativeElement } = this._windowRef.location;

    const transition$ = this._ngZone.onStable.pipe(
      take(1),
      mergeMap(() =>
        ngbRunTransition(this._ngZone, nativeElement, ({ classList }) => classList.add("show"), {
          animation,
          runningTransition: "continue",
        }),
      ),
    );

    return { windowRef: this._windowRef, transition$ };
  }

  close(animation = false): Observable<void> {
    if (!this._windowRef) {
      return of(undefined);
    }

    return ngbRunTransition(
      this._ngZone,
      this._windowRef.location.nativeElement,
      ({ classList }) => classList.remove("show"),
      { animation, runningTransition: "stop" },
    ).pipe(
      tap(() => {
        if (this._windowRef) {
          const viewIndex = this._viewContainerRef.indexOf(this._windowRef.hostView);
          if (viewIndex !== -1) {
            this._viewContainerRef.remove(viewIndex);
          } else {
            this._windowRef.destroy();
          }
          this._windowRef = null;
        }
        if (this._contentRef?.viewRef) {
          this._applicationRef.detachView(this._contentRef.viewRef);
          this._contentRef.viewRef.destroy();
          this._contentRef = null;
        }
      }),
    );
  }

  private _getContentRef(content?: string | TemplateRef<any>, templateContext?: any): ContentRef {
    if (!content) {
      return new ContentRef([]);
    } else if (content instanceof TemplateRef) {
      const viewRef = content.createEmbeddedView(templateContext);
      this._applicationRef.attachView(viewRef);
      return new ContentRef([viewRef.rootNodes], viewRef);
    } else {
      return new ContentRef([[this._document.createTextNode(`${content}`)]]);
    }
  }
}
