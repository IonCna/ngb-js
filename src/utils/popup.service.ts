import type { ITimeoutService } from "angular";
import angular from "angular";
import {
  ApplicationRef,
  type ComponentRef,
  type NgZone,
  TemplateRef,
  type ViewContainerRef,
  type ViewRef,
} from "ngjs-core";
import { mergeMap, type Observable, of, Subject, tap } from "rxjs";
import { type NgbTransitionStartFn, ngbRunTransition } from ".";

export class ContentRef<T = any> {
  constructor(
    public nodes: Node[][],
    public viewRef?: ViewRef,
    public componentRef?: ComponentRef<T>,
  ) {}
}

const popupTransition: NgbTransitionStartFn = (element) => {
  element.removeClass("show");
};

export class PopupService<T> {
  private _windowRef: ComponentRef<T> | null = null;
  private _contentRef: ContentRef | null = null;
  private readonly _applicationRef: ApplicationRef;
  private readonly $timeout: ITimeoutService;

  constructor(
    private _componentType: string,
    private _injector: angular.auto.IInjectorService,
    private _viewContainerRef: ViewContainerRef,
    private _ngZone: NgZone,
  ) {
    this._applicationRef = this._injector.get<ApplicationRef>(ApplicationRef.$name);
    this.$timeout = this._injector.get<ITimeoutService>("$timeout");
  }

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
      this.$timeout(
        () => {
          nextRenderSubject.next();
          nextRenderSubject.complete();
        },
        0,
        false,
      );
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
      this._applicationRef.attachView(viewRef);
      return new ContentRef([viewRef.rootNodes], viewRef);
    }

    return new ContentRef([[document.createTextNode(`${content}`)]]);
  }
}
