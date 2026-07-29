import { OffcanvasDismissReasons } from "@ngb/offcanvas/ngb-offcanvas-dismiss-reasons";
import type { NgbOffcanvasUpdatableOptions } from "@ngb/offcanvas/ngb-offcanvas-config.service";
import {
  ngbOffcanvasPanelHideTransition,
  ngbOffcanvasPanelShowTransition,
} from "@ngb/offcanvas/ngb-offcanvas-panel-transition";
import { assertAttribute, type NgbTransitionOptions, ngbRunTransition, toNativeElement } from "@ngb/utils";
import { DigestService } from "@ngb/utils/digest.service";
import { getFocusableBoundaryElements } from "@ngb/utils/focus-trap";
import type { IAugmentedJQuery, IComponentController, IComponentOptions, IScope } from "angular";
import angular from "angular";
import { defaultIfEmpty, filter, fromEvent, type Observable, Subject, takeUntil } from "rxjs";

const PANEL_ATTRIBUTES = [
  "animation",
  "ariaLabelledBy",
  "ariaDescribedBy",
  "keyboard",
  "panelClass",
  "position",
] as const;

type PanelAttribute = (typeof PANEL_ATTRIBUTES)[number];
type PanelOptions = Partial<Record<PanelAttribute, unknown>> & NgbOffcanvasUpdatableOptions;

export class NgbOffcanvasPanel implements IComponentController {
  animation?: boolean;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  keyboard = true;
  panelClass?: string;
  position: "start" | "end" | "top" | "bottom" = "start";

  onDismiss?: ({ $event }: { $event: any }) => void;

  shown = new Subject<void>();
  hidden = new Subject<void>();

  private _elWithFocus: Element | null = null; // element that is focused prior to offcanvas opening
  private _closed$ = new Subject<void>();
  private _appliedPositionClass?: string;
  private _appliedPanelClass?: string;

  constructor(
    private $element: IAugmentedJQuery,
    private $scope: IScope,
    private $digestService: DigestService,
  ) {}

  $onInit(): void {
    this._elWithFocus = document.activeElement;
  }

  $postLink(): void {
    this.$element.addClass("offcanvas");
    this.$element.attr("role", "dialog");
    this.$element.attr("tabindex", "-1");
    this.$element.attr("aria-modal", "true");

    this.$digestService.runOutsideDigest(() => this._show());
  }

  $onChanges(): void {
    const positionClass = `offcanvas-${this.position}`;

    if (this._appliedPositionClass) this.$element.removeClass(this._appliedPositionClass);
    this.$element.addClass(positionClass);
    this._appliedPositionClass = positionClass;

    if (this._appliedPanelClass)
      this._appliedPanelClass
        .split(/\s+/)
        .filter(Boolean)
        .forEach((className) => {
          this.$element.removeClass(className);
        });

    if (this.panelClass)
      this.panelClass
        .split(/\s+/)
        .filter(Boolean)
        .forEach((className) => {
          this.$element.addClass(className);
        });

    this._appliedPanelClass = this.panelClass;

    assertAttribute(this.$element, "aria-labelledby", this.ariaLabelledBy);
    assertAttribute(this.$element, "aria-describedby", this.ariaDescribedBy);
  }

  $onDestroy(): void {
    this._disableEventHandling();
  }

  dismiss(reason: any): void {
    this.onDismiss?.({ $event: reason });
  }

  updateOptions(options: NgbOffcanvasUpdatableOptions) {
    const source: PanelOptions = options;

    this.$scope.$evalAsync(() => {
      PANEL_ATTRIBUTES.forEach((option) => {
        if (angular.isDefined(source[option])) {
          Object.assign(this, { [option]: source[option] });
        }
      });

      this.$onChanges();
    });
  }

  hide(): Observable<void> {
    const context: NgbTransitionOptions<unknown> = { animation: Boolean(this.animation), runningTransition: "stop" };

    const offcanvasTransition = ngbRunTransition(
      this.$digestService,
      this.$element,
      ngbOffcanvasPanelHideTransition,
      context,
    ).pipe(defaultIfEmpty(undefined));

    offcanvasTransition.subscribe(() => {
      this.hidden.next();
      this.hidden.complete();
    });

    this._disableEventHandling();
    this._restoreFocus();

    return offcanvasTransition;
  }

  private _show(): void {
    const context: NgbTransitionOptions<unknown> = {
      animation: Boolean(this.animation),
      runningTransition: "continue",
    };

    const offcanvasTransition = ngbRunTransition(
      this.$digestService,
      this.$element,
      ngbOffcanvasPanelShowTransition,
      context,
    ).pipe(defaultIfEmpty(undefined));

    offcanvasTransition.subscribe(() => {
      this.shown.next();
      this.shown.complete();
    });

    this._enableEventHandling();
    this._setFocus();
  }

  private _enableEventHandling(): void {
    const native = toNativeElement(this.$element);

    fromEvent<KeyboardEvent>(native, "keydown")
      .pipe(
        takeUntil(this._closed$),
        filter((event) => event.key === "Escape"),
      )
      .subscribe((event) => {
        if (this.keyboard) {
          requestAnimationFrame(() => {
            if (!event.defaultPrevented) {
              this.$scope.$evalAsync(() => this.dismiss(OffcanvasDismissReasons.ESC));
            }
          });
        }
      });
  }

  private _disableEventHandling(): void {
    this._closed$.next();
  }

  private _setFocus(): void {
    const native = toNativeElement(this.$element);

    if (!native.contains(document.activeElement)) {
      const autoFocusable = native.querySelector("[ngbAutofocus]") as HTMLElement;
      const [firstFocusable] = getFocusableBoundaryElements(native);

      const elementToFocus = autoFocusable || firstFocusable || native;
      elementToFocus.focus();
    }
  }

  private _restoreFocus(): void {
    const body = document.body as HTMLBodyElement;
    const elWithFocus = this._elWithFocus;
    const validElementToFocus = elWithFocus instanceof HTMLElement && body.contains(elWithFocus);
    const elementToFocus: HTMLElement = validElementToFocus ? elWithFocus : body;

    this.$digestService.runOutsideDigest(() => elementToFocus.focus());

    this._elWithFocus = null;
  }

  static get $name() {
    return "ngbOffcanvasPanel";
  }

  static get $inject() {
    return ["$element", "$scope", DigestService.$name];
  }

  static get $factory(): IComponentOptions {
    return {
      bindings: {
        animation: "<?",
        ariaLabelledBy: "<?",
        ariaDescribedBy: "<?",
        keyboard: "<?",
        panelClass: "<?",
        position: "<?",
        onDismiss: "&?",
      },
      controller: NgbOffcanvasPanel,
      controllerAs: "$",
      template: "",
    };
  }
}
