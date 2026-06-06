import type {
  IAugmentedJQuery,
  ICompileService,
  IRootScopeService,
  IScope,
  ITimeoutService,
  ITranscludeFunction,
} from "angular";
import angular from "angular";
import { mergeMap, type Observable, of, Subject, tap } from "rxjs";
import { camelToKebabCase, type NgbTransitionStartFn, ngbRunTransition } from ".";

function targetIsTranscludeFunction(target: unknown): target is ITranscludeFunction {
  return Boolean(target && Object.hasOwn(target, "isSlotFilled"));
}

export class ContentRef<T = any> {
  constructor(
    public $element: IAugmentedJQuery,
    public $scope?: IScope,
    public componentInstance?: T,
  ) {}

  public setInput(key: string, value?: unknown) {
    const isFn = angular.isFunction(value);
    this.$scope?.$evalAsync(() => {
      if (!this.componentInstance) {
        throw new Error("can not set on componentInstance because is undefined");
      }

      (this.componentInstance as any)[key] = isFn ? value?.() : value;
    });
  }
}

export interface IPopupService<T = any> {
  open(
    content?: string | ITranscludeFunction,
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
    private $timeout: ITimeoutService,
    private $rootScope: IRootScopeService,
    private _componentType: string,
  ) {}

  open(content?: string | ITranscludeFunction, context?: any, animation = false) {
    if (!this._windowRef) {
      this._contentRef = this._getContentRef(content, context);
      const component = camelToKebabCase(this._componentType);

      const scope = this.$rootScope.$new();
      const linkFn = this.$compile(`<${component}></${component}>`);
      const compiled = linkFn(scope);
      const instance = compiled.controller(this._componentType);

      this._windowRef = new ContentRef<T>(compiled, scope, instance);
    }

    const { $element } = this._windowRef!;

    const nextRenderSubject = new Subject<void>();

    this.$timeout(() => {
      nextRenderSubject.next();
      nextRenderSubject.complete();
    }, 0);

    const transition$ = nextRenderSubject.pipe(
      mergeMap(() =>
        ngbRunTransition(
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

    return ngbRunTransition(this._windowRef.$element, popupTransition, {
      animation,
      runningTransition: "stop",
    }).pipe(
      tap(() => {
        this._contentRef?.$scope?.$destroy();
        this._contentRef = null;

        this._windowRef?.$scope?.$destroy();
        this._windowRef = null;
      }),
    );
  }

  private _getContentRef(content?: string | ITranscludeFunction, context?: any) {
    if (!content) return new ContentRef(angular.element([]));

    if (targetIsTranscludeFunction(content)) {
      const scope = this.$rootScope.$new();
      angular.extend(scope, context);

      const compiled = content(scope, angular.noop);
      return new ContentRef(compiled, scope);
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
    private $timeout: ITimeoutService,
    private $rootScope: IRootScopeService,
  ) {}

  $create(_componentType: string) {
    return new PopupService(this.$compile, this.$timeout, this.$rootScope, _componentType);
  }

  static get $inject() {
    return ["$compile", "$timeout", "$rootScope"];
  }

  static get $name() {
    return "ngb.popup.factory";
  }
}
