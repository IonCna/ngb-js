import { ngbRunTransition } from "@ngb/utils";
import { DigestService } from "@ngb/utils/digest.service";
import type { IAugmentedJQuery, IComponentController, IComponentOptions, IScope } from "angular";
import angular from "angular";
import { defaultIfEmpty } from "rxjs";
import { ngbOffcanvasFadeInTransition, ngbOffcanvasFadeOutTransition } from "@ngb/offcanvas/ngb-offcanvas-transition";
import { OffcanvasDismissReasons } from "@ngb/offcanvas/ngb-offcanvas-dismiss-reasons";
import type { NgbOffcanvasUpdatableOptions } from "@ngb/offcanvas/ngb-offcanvas-config.service";

const BACKDROP_ATTRIBUTES = [
  "animation",
  "backdropClass",
] as const satisfies readonly (keyof NgbOffcanvasUpdatableOptions)[];

type BackdropAttribute = (typeof BACKDROP_ATTRIBUTES)[number];
type BackdropOptions = Partial<Record<BackdropAttribute, unknown>> & NgbOffcanvasUpdatableOptions;

export class NgbOffcanvasBackdrop implements IComponentController {
  animation?: boolean;
  backdropClass?: string;
  static?: boolean;
  onDismiss?: ({ $event }: { $event: OffcanvasDismissReasons }) => void;

  private _appliedBackdropClass?: string;

  constructor(
    private $element: IAugmentedJQuery,
    private $scope: IScope,
    private digestService: DigestService,
  ) {}

  $postLink(): void {
    ngbRunTransition(this.digestService, this.$element, ngbOffcanvasFadeInTransition, {
      animation: this.animation ?? true,
      runningTransition: "continue",
    });

    this.$element.addClass("offcanvas-backdrop");

    this.$element.on("mousedown", this.dismiss.bind(this));
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

  $onDestroy(): void {
    this.$element.off("mousedown");
  }

  hide() {
    return ngbRunTransition(this.digestService, this.$element, ngbOffcanvasFadeOutTransition, {
      animation: this.animation ?? true,
      runningTransition: "stop",
    }).pipe(defaultIfEmpty(undefined));
  }

  dismiss() {
    if (this.static) return;
    this.onDismiss?.({ $event: OffcanvasDismissReasons.BACKDROP_CLICK });
  }

  updateOptions(options: NgbOffcanvasUpdatableOptions) {
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
    return "ngbOffcanvasBackdrop";
  }

  static get $inject() {
    return ["$element", "$scope", DigestService.$name];
  }

  static get $factory(): IComponentOptions {
    return {
      bindings: {
        animation: "<?",
        backdropClass: "@?",
        static: "<?",
        onDismiss: "&?",
      },
      controller: NgbOffcanvasBackdrop,
      template: "",
    };
  }
}
