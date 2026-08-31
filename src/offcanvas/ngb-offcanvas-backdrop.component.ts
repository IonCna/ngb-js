import { ngbRunTransition } from "@ngb/utils";
import type { IAugmentedJQuery, IComponentController, IComponentOptions } from "angular";
import angular from "angular";
import { NgZone } from "ngjs-core";
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
    private _ngZone: NgZone,
  ) {}

  $postLink(): void {
    const animation = this.animation ?? true;

    this._ngZone.runOutsideAngular(() =>
      queueMicrotask(() =>
        ngbRunTransition(this._ngZone, this.$element, ngbOffcanvasFadeInTransition, {
          animation,
          runningTransition: "continue",
        }),
      ),
    );

    this.$element.addClass("offcanvas-backdrop");
    this.$element.toggleClass("fade", animation);

    this.$element.on("mousedown", this.dismiss.bind(this));
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

  $onDestroy(): void {
    this.$element.off("mousedown");
  }

  hide() {
    return ngbRunTransition(this._ngZone, this.$element, ngbOffcanvasFadeOutTransition, {
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

    this._ngZone.run(() => {
      BACKDROP_ATTRIBUTES.forEach((attr) => {
        if (angular.isDefined(source[attr])) {
          Object.assign(this, { [attr]: source[attr] });
        }
      });
      this.$onChanges();
    });
  }

  static get $name() {
    return "ngbOffcanvasBackdrop";
  }

  static get $inject() {
    return ["$element", NgZone.$name];
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
