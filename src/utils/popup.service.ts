import angular from "angular";
import { type ComponentRef, NgZone, TemplateRef, type ViewContainerRef, type ViewRef } from "ngjs-core";
import { mergeMap, type Observable, of, Subject, tap } from "rxjs";
import { type NgbTransitionStartFn, ngbRunTransition } from ".";

export class ContentRef<T = any> {
  constructor(
    public nodes: Node[][],
    public viewRef?: ViewRef,
    public componentRef?: ComponentRef<T>,
  ) {}
}

export interface IPopupService<T = any> {
  open(
    content?: string | TemplateRef<any>,
    context?: any,
    animation?: boolean,
  ): {
    windowRef: ComponentRef<T>;
    transition$: Observable<void>;
  };

  close(animation?: boolean): Observable<void>;
}

const popupTransition: NgbTransitionStartFn = (element) => {
  element.removeClass("show");
};

export class PopupService<T> implements IPopupService<T> {
  private _windowRef: ComponentRef<T> | null = null;
  private _contentRef: ContentRef | null = null;

  constructor(
    private _injector: angular.auto.IInjectorService,
    private _viewContainerRef: ViewContainerRef,
    private _ngZone: NgZone,
    private _componentType: string,
  ) {}

  open(content?: string | TemplateRef<any>, context?: any, animation = false) {
    if (!this._windowRef) {
      this._contentRef = this._getContentRef(content, context);
      this._windowRef = this._viewContainerRef.createComponent<T>(this._componentType, {
        injector: this._injector,
        projectableNodes: this._contentRef.nodes,
      });
    }

    const nativeElement = this._windowRef.location.nativeElement;
    const $element = angular.element(nativeElement);

    const nextRenderSubject = new Subject<void>();

    this._ngZone.runOutsideAngular(() => {
      queueMicrotask(() => {
        nextRenderSubject.next();
        nextRenderSubject.complete();
      });
    });

    const transition$ = nextRenderSubject.pipe(
      mergeMap(() =>
        ngbRunTransition(
          this._ngZone,
          $element,
          (element) => {
            element.addClass("show");
          },
          {
            animation,
            runningTransition: "continue",
          },
        ),
      ),
    );

    return { windowRef: this._windowRef, transition$ };
  }

  close(animation = false): Observable<void> {
    if (!this._windowRef) {
      return of(undefined);
    }

    return ngbRunTransition(this._ngZone, angular.element(this._windowRef.location.nativeElement), popupTransition, {
      animation,
      runningTransition: "stop",
    }).pipe(
      tap(() => {
        this._windowRef?.destroy();
        this._contentRef?.viewRef?.destroy();
        this._contentRef = null;
        this._windowRef = null;
      }),
    );
  }

  private _getContentRef(content?: string | TemplateRef<any>, context?: any): ContentRef {
    if (!content) return new ContentRef([]);

    if (content instanceof TemplateRef) {
      const viewRef = content.createEmbeddedView(context ?? {});
      return new ContentRef([viewRef.rootNodes], viewRef);
    }

    return new ContentRef([[document.createTextNode(`${content}`)]]);
  }
}

export class PopupFactory {
  constructor(
    private _injector: angular.auto.IInjectorService,
    private _viewContainerRef: ViewContainerRef,
    private _ngZone: NgZone,
  ) {}

  $create<T = any>(_componentType: string) {
    return new PopupService<T>(this._injector, this._viewContainerRef, this._ngZone, _componentType);
  }

  static get $inject() {
    return ["$injector", "ViewContainerRef", NgZone.$name];
  }

  static get $name() {
    return "ngb.popup.factory";
  }
}
