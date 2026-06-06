import {
  ngbModalBackdropFadeInTransition,
  ngbModalBackdropFadeOutTransition,
} from "@ngb/modal/ngb-modal-backdrop-transition";
import { NgbModalConfig, type NgbModalUpdatableOptions } from "@ngb/modal/ngb-modal-config.service";
import { ngbRunTransition } from "@ngb/utils";
import type { IAugmentedJQuery, IComponentController, IComponentOptions, IScope } from "angular";
import angular from "angular";
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
    private $scope: IScope,
    private $ngbModalConfig: NgbModalConfig,
  ) {}

  $postLink(): void {
    const backdropClass = this.backdropClass ? this.backdropClass : "";

    this.$element.addClass(`modal-backdrop ${backdropClass}`);
    this.$element.css({ "z-index": "1055" });

    this.$scope.$evalAsync(() =>
      ngbRunTransition(this.$element, ngbModalBackdropFadeInTransition, {
        animation: this.animation ?? this.$ngbModalConfig.animation,
        runningTransition: "continue",
      }),
    );
  }

  $onChanges(): void {
    this.$element.toggleClass("show", !this.animation);
    this.$element.toggleClass("fade", this.animation);

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
    return ngbRunTransition(this.$element, ngbModalBackdropFadeOutTransition, {
      animation: this.animation ?? this.$ngbModalConfig.animation,
      runningTransition: "stop",
    });
  }

  updateOptions(options: NgbModalUpdatableOptions) {
    const source: BackdropOptions = options;

    this.$scope.$evalAsync(() =>
      BACKDROP_ATTRIBUTES.forEach((attr) => {
        if (angular.isDefined(source[attr])) {
          Object.assign(this, { [attr]: source[attr] });
        }
      }),
    );
  }

  static get $name() {
    return "ngbModalBackdrop";
  }

  static get $inject() {
    return ["$element", "$scope", NgbModalConfig.$name];
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
