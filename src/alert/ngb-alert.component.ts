import template from "@ngb/alert/ngb-alert.component.html";
import { NgbAlertConfig } from "@ngb/alert/ngb-alert-config.service";
import { ngbAlertFadingTransition } from "@ngb/alert/ngb-alert-transition";
import { ngbRunTransition } from "@ngb/utils/transition/ngb-transition";
import type { IAugmentedJQuery, IComponentController, IComponentOptions, ILogService } from "angular";
import { NgZone } from "ngjs-core";
import type { Observable } from "rxjs";

export interface INgbAlert {
  close(): Observable<void>;
}

export class NgbAlert implements IComponentController, INgbAlert {
  protected animation!: boolean;
  protected dismissible!: boolean;
  protected type!: string;
  protected closed?: () => void;

  constructor(
    private readonly $element: IAugmentedJQuery,
    private readonly ngbAlertConfig: NgbAlertConfig,
    private readonly $log: ILogService,
    private readonly _ngZone: NgZone,
  ) {}

  $onInit(): void {
    this.animation = this.animation ?? this.ngbAlertConfig.animation;
    this.dismissible = this.dismissible ?? this.ngbAlertConfig.dismissible;
    this.type = this.type ?? this.ngbAlertConfig.type;
  }

  $postLink(): void {
    this.$element.attr("role", "alert");
    this.$element.addClass("alert d-block show");

    const type = `alert-${this.type}`;
    this.$element.addClass(type);
  }

  $onChanges(): void {
    this.$element.toggleClass("fade", this.animation);
    this.$element.toggleClass("alert-dismissible", this.dismissible);
  }

  close(): Observable<void> {
    const transition = ngbRunTransition(this._ngZone, this.$element, ngbAlertFadingTransition, {
      animation: this.animation ?? this.ngbAlertConfig.animation,
      runningTransition: "continue",
    });

    transition.subscribe(() => {
      this.closed?.();
      this.$log.info("[ngb.alert]: was closed");
    });

    return transition;
  }

  static get $name() {
    return "ngbAlert";
  }

  static get $inject() {
    return ["$element", NgbAlertConfig.$name, "$log", NgZone.$name];
  }

  static get $factory(): IComponentOptions {
    return {
      bindings: {
        animation: "<?",
        dismissible: "<?",
        type: "@?",
        closed: "&?",
      },
      transclude: true,
      controller: NgbAlert,
      controllerAs: "$",
      template,
    };
  }
}
