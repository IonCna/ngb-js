import type {
  IAugmentedJQuery,
  ICompileService,
  IOnChangesObject,
  IRootScopeService,
  IScope,
} from "angular";
import angular from "angular";
import { type EmbeddedViewRef, NgZone, TemplateRef } from "ngjs-core";
import { mergeMap, type Observable, of, Subject, tap } from "rxjs";
import { camelToKebabCase, type NgbTransitionStartFn, ngbRunTransition } from ".";

export class ContentRef<T = any> {
  constructor(
    public $element: IAugmentedJQuery,
    public $scope?: IScope,
    public componentInstance?: T,
    private embeddedViewRef?: EmbeddedViewRef<any>,
  ) {}

  public setInput(key: string, value?: unknown) {
    if (!this.componentInstance) {
      throw new Error("can not set on componentInstance because is undefined");
    }

    const instance = this.componentInstance as any;
    const previousValue = instance[key];
    instance[key] = value;
    instance.$onChanges?.({
      [key]: {
        currentValue: value,
        previousValue,
        isFirstChange: () => previousValue === undefined,
      },
    } satisfies IOnChangesObject);
    this.$scope?.$evalAsync();
  }

  public destroy(): void {
    this.embeddedViewRef?.destroy();
    this.embeddedViewRef = undefined;
    this.$scope?.$destroy();
    this.$scope = undefined;
  }
}

export interface IPopupService<T = any> {
  open(
    content?: string | TemplateRef<any>,
    context?: any,
    animation?: boolean,
  ): {
    windowRef: ContentRef<T>;
    transition$: Observable<void>;
  };

  close(animation?: boolean): Observable<void>;
}

const popupTransition: NgbTransitionStartFn = (element) => {
  element.removeClass("show");
};

class PopupService<T> implements IPopupService<T> {
  private _windowRef: ContentRef<T> | null = null;
  private _contentRef: ContentRef<T> | null = null;

  constructor(
    private $compile: ICompileService,
    private _ngZone: NgZone,
    private $rootScope: IRootScopeService,
    private _componentType: string,
  ) {}

  open(content?: string | TemplateRef<any>, context?: any, animation = false) {
    if (!this._windowRef) {
      this._contentRef = this._getContentRef(content, context);
      const component = camelToKebabCase(this._componentType);

      const scope = this.$rootScope.$new();
      const host = angular.element(`<${component}></${component}>`);

      const linkFn = this.$compile(host);
      const compiled = linkFn(scope);
      const instance = compiled.controller(this._componentType);
      const contentHost = compiled[0].querySelector?.("[ngb-popup-content]");
      angular.element(contentHost ?? compiled).append(this._contentRef.$element);

      this._windowRef = new ContentRef<T>(compiled, scope, instance);
    }

    const { $element } = this._windowRef!;

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

    const ref = this._windowRef!;
    return { windowRef: ref, transition$ };
  }

  close(animation = false): Observable<void> {
    if (!this._windowRef) {
      return of(undefined);
    }

    return ngbRunTransition(this._ngZone, this._windowRef.$element, popupTransition, {
      animation,
      runningTransition: "stop",
    }).pipe(
      tap(() => {
        this._contentRef?.destroy();
        this._contentRef = null;

        this._windowRef?.$scope?.$destroy();
        this._windowRef = null;
      }),
    );
  }

  private _getContentRef(content?: string | TemplateRef<any>, context?: any) {
    if (!content) return new ContentRef(angular.element([]));

    if (content instanceof TemplateRef) {
      const viewRef = content.createEmbeddedView(context ?? {});
      return new ContentRef(angular.element(viewRef.rootNodes as any), undefined, undefined, viewRef);
    }

    const node = document.createTextNode(`${content}`);

    //@ts-expect-error
    const $text = angular.element(node);
    return new ContentRef($text);
  }
}

export class PopupFactory {
  constructor(
    private $compile: ICompileService,
    private _ngZone: NgZone,
    private $rootScope: IRootScopeService,
  ) {}

  $create<T = any>(_componentType: string) {
    return new PopupService<T>(this.$compile, this._ngZone, this.$rootScope, _componentType);
  }

  static get $inject() {
    return ["$compile", NgZone.$name, "$rootScope"];
  }

  static get $name() {
    return "ngb.popup.factory";
  }
}
