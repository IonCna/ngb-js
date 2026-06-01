import type {
  IAugmentedJQuery,
  ICompileService,
  IDocumentService,
  IPromise,
  IQService,
  IRootScopeService,
  IScope,
  ITimeoutService,
  ITranscludeFunction,
} from "angular";
import angular from "angular";
import { camelToKebabCase, type NgbTransitionStartFn, ngbRunTransition, toNativeElement } from ".";

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
    transition$: IPromise<void>;
  };

  close(animation?: boolean): IPromise<void>;
}

const popupTransition: NgbTransitionStartFn = (element) => {
  element.removeClass("show");
};

class PopupService<T> implements IPopupService<T> {
  private _windowRef: ContentRef<T> | null = null;
  private _contentRef: ContentRef<T> | null = null;

  constructor(
    private $document: IDocumentService,
    private $compile: ICompileService,
    private $timeout: ITimeoutService,
    private $q: IQService,
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

    const nextRender = this.$q.defer();

    this.$timeout(() => {
      nextRender.resolve();
    }, 0);

    const transition$ = nextRender.promise.then(() =>
      ngbRunTransition(
        this.$q,
        this.$timeout,
        $element,
        (element) => {
          element.addClass("show");
        },
        {
          animation,
          runningTransition: "continue",
        },
      ),
    );

    const ref = this._windowRef!;
    return { windowRef: ref, transition$ };
  }

  async close(animation = false) {
    if (!this._windowRef) {
      return this.$q.resolve();
    }

    await ngbRunTransition(this.$q, this.$timeout, this._windowRef?.$element, popupTransition, {
      animation,
      runningTransition: "stop",
    });

    this._contentRef?.$scope?.$destroy();
    this._contentRef = null;

    this._windowRef?.$scope?.$destroy();
    this._windowRef = null;
  }

  private _getContentRef(content?: string | ITranscludeFunction, context?: any) {
    if (!content) return new ContentRef(angular.element([]));

    if (targetIsTranscludeFunction(content)) {
      const scope = this.$rootScope.$new();
      angular.extend(scope, context);

      const compiled = content(scope, angular.noop);
      return new ContentRef(compiled, scope);
    }

    const document = toNativeElement<Document>(this.$document);
    const node = document.createTextNode(`${content}`);

    //@ts-expect-error
    const $text = angular.element(node);
    return new ContentRef($text);
  }
}

export class PopupFactory {
  constructor(
    private $document: IDocumentService,
    private $compile: ICompileService,
    private $timeout: ITimeoutService,
    private $q: IQService,
    private $rootScope: IRootScopeService,
  ) {}

  $create(_componentType: string) {
    return new PopupService(this.$document, this.$compile, this.$timeout, this.$q, this.$rootScope, _componentType);
  }

  static get $inject() {
    return ["$document", "$compile", "$timeout", "$q", "$rootScope"];
  }

  static get $name() {
    return "ngb.popup.factory";
  }
}
