import {
  ngbModalBackdropFadeInTransition,
  ngbModalBackdropFadeOutTransition,
} from "@ngb/modal/ngb-modal-backdrop-transition";
import { NgbModalConfig, type NgbModalUpdatableOptions } from "@ngb/modal/ngb-modal-config.service";
import { ngbRunTransition } from "@ngb/utils";
import type { IAugmentedJQuery, IComponentController, IComponentOptions } from "angular";
import angular from "angular";
import { ChangeDetectorRef, NgZone } from "ngjs-core";
import type { Observable } from "rxjs";

const BACKDROP_ATTRIBUTES = [
  "animation",
  "backdropClass",
] as const satisfies readonly (keyof NgbModalUpdatableOptions)[];
type NgbModalBackdropAttribute = (typeof BACKDROP_ATTRIBUTES)[number];
type BackdropOptions = Partial<Record<NgbModalBackdropAttribute, unknown>> & NgbModalUpdatableOptions;

export class NgbModalBackdrop implements IComponentController {
  animation?: boolean;
  backdropClass?: string;

  private _appliedBackdropClass?: string;

  constructor(
    private $element: IAugmentedJQuery,
    private $ngbModalConfig: NgbModalConfig,
    private _ngZone: NgZone,
    private _cdRef: ChangeDetectorRef,
  ) {}

  $postLink(): void {
    const backdropClass = this.backdropClass ? this.backdropClass : "";
    const animation = this.animation ?? this.$ngbModalConfig.animation;

    this.$element.addClass(`modal-backdrop ${backdropClass}`);
    this.$element.toggleClass("fade", animation);
    this.$element.css({ "z-index": "1055" });

    this._ngZone.runOutsideAngular(() =>
      queueMicrotask(() =>
        ngbRunTransition(this._ngZone, this.$element, ngbModalBackdropFadeInTransition, {
          animation,
          runningTransition: "continue",
        }),
      ),
    );
  }

  $onChanges(): void {
    if (this._appliedBackdropClass)
      this._appliedBackdropClass
        .split(/\s+/)
        .filter(Boolean)
        .forEach((className) => {
          this.$element.removeClass(className);
        });

    if (this.backdropClass)
      this.backdropClass
        .split(/\s+/)
        .filter(Boolean)
        .forEach((className) => {
          this.$element.addClass(className);
        });

    this._appliedBackdropClass = this.backdropClass;
  }

  hide(): Observable<void> {
    return ngbRunTransition(this._ngZone, this.$element, ngbModalBackdropFadeOutTransition, {
      animation: this.animation ?? this.$ngbModalConfig.animation,
      runningTransition: "stop",
    });
  }

  updateOptions(options: NgbModalUpdatableOptions) {
    const source: BackdropOptions = options;

    BACKDROP_ATTRIBUTES.forEach((attr) => {
      if (angular.isDefined(source[attr])) {
        Object.assign(this, { [attr]: source[attr] });
      }
    });
    this.$onChanges();
    this._cdRef.markForCheck();
  }

  static get $name() {
    return "ngbModalBackdrop";
  }

  static get $inject() {
    return ["$element", NgbModalConfig.$name, NgZone.$name, ChangeDetectorRef.$name];
  }

  static get $factory(): IComponentOptions {
    return {
      controller: NgbModalBackdrop,
      controllerAs: "$",
      bindings: {
        animation: "<?",
        backdropClass: "@?",
      },
    };
  }
}
