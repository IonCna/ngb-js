import template from "@ngb/toast/ngb-toast.component.html";
import { NgbToastConfig } from "@ngb/toast/ngb-toast-config.service";
import type { NgbToastHeader } from "@ngb/toast/ngb-toast-header.directive";
import { ngbToastFadeInTransition, ngbToastFadeOutTransition } from "@ngb/toast/ngb-toast-transition";
import { ngbRunTransition } from "@ngb/utils/transition/ngb-transition";
import type {
  IAttributes,
  IAugmentedJQuery,
  IComponentController,
  IComponentOptions,
  IOnChangesObject,
  IPromise,
  IQService,
  ITimeoutService,
  ITranscludeFunction,
} from "angular";

export interface INgbToast {
  hide(): IPromise<void>;
  show(): IPromise<void>;
}

export class NgbToast implements IComponentController, INgbToast {
  protected animation?: boolean;
  protected autohide?: boolean;
  protected delay?: number;
  protected header?: string;
  protected ariaLive?: string;
  protected contentHeaderTpl?: ITranscludeFunction | null = null;

  protected hidden?: () => void;
  protected shown?: () => void;

  private _timeoutID?: IPromise<void> | null = null;

  constructor(
    private $element: IAugmentedJQuery,
    private ngbToastConfig: NgbToastConfig,
    private $q: IQService,
    private $timeout: ITimeoutService,
    private $attrs: IAttributes,
  ) {}

  $onInit(): void {
    this.animation = this.animation ?? this.ngbToastConfig.animation;
    this.autohide = this.autohide ?? this.ngbToastConfig.autohide;
    this.delay = this.delay ?? this.ngbToastConfig.delay;
    this.ariaLive = this.$attrs.ariaLive ?? this.ngbToastConfig.ariaLive;
  }

  $postLink(): void {
    this.$element.attr("role", "alert");
    this.$element.attr("aria-live", this.ariaLive ?? this.ngbToastConfig.ariaLive);
    this.$element.attr("aria-atomic", "true");
    this.$element.addClass("toast d-block");

    this._init();
    this.show();
  }

  $onChanges(changes: IOnChangesObject): void {
    this.$element.toggleClass("fade", this.animation);

    if ("autohide" in changes) {
      this._clearTimeout();
      this._init();
    }
  }

  register(header: NgbToastHeader): void {
    this.contentHeaderTpl = header.$transclude;
  }

  hide(): IPromise<void> {
    this._clearTimeout();

    const transition = ngbRunTransition(this.$q, this.$timeout, this.$element, ngbToastFadeOutTransition, {
      animation: this.animation ?? this.ngbToastConfig.animation,
      runningTransition: "stop",
    });

    transition.then(() => this.hidden?.());
    return transition;
  }

  show(): IPromise<void> {
    const transition = ngbRunTransition(this.$q, this.$timeout, this.$element, ngbToastFadeInTransition, {
      animation: this.animation ?? this.ngbToastConfig.animation,
      runningTransition: "continue",
    });

    transition.then(() => this.shown?.());
    return transition;
  }

  private _init(): void {
    if (this.autohide && !this._timeoutID) {
      this._timeoutID = this.$timeout(() => this.hide(), this.delay);
    }
  }

  private _clearTimeout(): void {
    if (this._timeoutID) {
      this.$timeout.cancel(this._timeoutID);
      this._timeoutID = null;
    }
  }

  static get $name() {
    return "ngbToast";
  }

  static get $inject() {
    return ["$element", NgbToastConfig.$name, "$q", "$timeout", "$attrs"];
  }

  static get $factory(): IComponentOptions {
    return {
      bindings: {
        animation: "<?",
        autohide: "<?",
        delay: "<?",
        header: "@?",
        hidden: "&?",
        shown: "&?",
      },
      controllerAs: "$",
      transclude: true,
      controller: NgbToast,
      template,
    };
  }
}
