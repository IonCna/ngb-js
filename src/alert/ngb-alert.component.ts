import template from "@ngb/alert/ngb-alert.component.html";
import { NgbAlertConfig } from "@ngb/alert/ngb-alert-config.service";
import { ngbAlertFadingTransition } from "@ngb/alert/ngb-alert-transition";
import { ngbRunTransition } from "@ngb/utils/transition/ngb-transition";
import type { IAugmentedJQuery, IComponentController, IComponentOptions } from "angular";
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

  private _appliedType?: string;

  constructor(
    private readonly $element: IAugmentedJQuery,
    private readonly ngbAlertConfig: NgbAlertConfig,
    private readonly _ngZone: NgZone,
  ) {}

  $onInit(): void {
    this.animation = this.animation ?? this.ngbAlertConfig.animation;
    this.dismissible = this.dismissible ?? this.ngbAlertConfig.dismissible;
    this.type = this.type ?? this.ngbAlertConfig.type;

    // $onChanges runs before $onInit, so the config-derived defaults above
    // are not yet reflected in the DOM. Re-apply them now.
    this.$onChanges();
  }

  $postLink(): void {
    this.$element.attr("role", "alert");
    this.$element.addClass("alert d-block show");
  }

  $onChanges(): void {
    this.$element.toggleClass("fade", this.animation);
    this.$element.toggleClass("alert-dismissible", this.dismissible);

    if (this._appliedType) this.$element.removeClass(`alert-${this._appliedType}`);
    if (this.type) this.$element.addClass(`alert-${this.type}`);
    this._appliedType = this.type;
  }

  close(): Observable<void> {
    const transition = ngbRunTransition(this._ngZone, this.$element, ngbAlertFadingTransition, {
      animation: this.animation ?? this.ngbAlertConfig.animation,
      runningTransition: "continue",
    });

    transition.subscribe(() => {
      this.closed?.();
    });

    return transition;
  }

  static get $name() {
    return "ngbAlert";
  }

  static get $inject() {
    return ["$element", NgbAlertConfig.$name, NgZone.$name];
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
