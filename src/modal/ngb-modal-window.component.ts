import type { NgbModalUpdatableOptions } from "@ngb/modal/ngb-modal-config.service";
import { ModalDismissReasons } from "@ngb/modal/ngb-modal-dismiss-reasons";
import template from "@ngb/modal/ngb-modal-window.component.html";
import {
  ngbModalBumpBackdropTransition,
  ngbModalWindowFadeInTransition,
  ngbModalWindowFadeOutTransition,
} from "@ngb/modal/ngb-modal-window-transition";
import { type NgbTransitionOptions, type NgbTransitionStartFn, ngbRunTransition, toNativeElement } from "@ngb/utils";
import { DigestService } from "@ngb/utils/digest.service";
import { getFocusableBoundaryElements } from "@ngb/utils/focus-trap";
import type { IAugmentedJQuery, IComponentController, IComponentOptions, ILogService, IScope } from "angular";
import angular from "angular";
import { filter, fromEvent, type Observable, Subject, switchMap, take, takeUntil, tap, zip } from "rxjs";

const WINDOW_ATTRIBUTES = [
  "animation",
  "ariaLabelledBy",
  "ariaDescribedBy",
  "backdrop",
  "centered",
  "fullscreen",
  "keyboard",
  "role",
  "scrollable",
  "size",
  "windowClass",
  "modalDialogClass",
] as const;

type WindowAttribute = (typeof WINDOW_ATTRIBUTES)[number];
type WindowOptions = Partial<Record<WindowAttribute, unknown>> & NgbModalUpdatableOptions;
const noopTransition: NgbTransitionStartFn = () => {};

export class NgbModalWindow implements IComponentController {
  public animation?: boolean;
  public ariaLabelledBy?: string;
  public ariaDescribedBy?: string;
  public backdrop: boolean | string = true;
  public centered?: string;
  public fullscreen?: string | boolean;
  public keyboard = true;
  public role: string = "dialog";
  public scrollable?: string;
  public size?: string;
  public windowClass?: string;
  public modalDialogClass?: string;

  private _elWithFocus: Element | null = null;
  private _dialogEl?: IAugmentedJQuery;
  private _closed$ = new Subject<void>();
  public shown = new Subject<void>();
  public hidden = new Subject<void>();
  private _dismissListener?: (reason: any) => void;
  private _appliedWindowClass?: string;

  constructor(
    private $scope: IScope,
    private $element: IAugmentedJQuery,
    private $digestService: DigestService,
    private $log: ILogService,
  ) {}

  $onInit(): void {
    this._elWithFocus = document.activeElement;
  }

  $onDestroy(): void {
    this._disableEventHandling();
  }

  $postLink(): void {
    this.$element.addClass("modal d-block");
    this.$element.attr("tabindex", -1);
    this.$element.attr("aria-modal", "true");

    const nativeDialog = toNativeElement(this.$element).querySelector(".modal-dialog");

    if (!nativeDialog) throw new Error("modal-dialog element is not present in template!");
    this._dialogEl = angular.element(nativeDialog);

    this.$digestService.runOutsideDigest(() => this._show());
  }

  $onChanges(): void {
    this.$element.toggleClass("fade", this.animation);

    if (this._appliedWindowClass)
      this._appliedWindowClass
        .split(/\s+/)
        .filter(Boolean)
        .forEach((className) => {
          this.$element.removeClass(className);
        });

    if (this.windowClass)
      this.windowClass
        .split(/\s+/)
        .filter(Boolean)
        .forEach((className) => {
          this.$element.addClass(className);
        });

    this._appliedWindowClass = this.windowClass;

    if (this.ariaLabelledBy) this.$element.attr("aria-labelledby", this.ariaLabelledBy);
    else this.$element.removeAttr("aria-labelledby");

    if (this.ariaDescribedBy) this.$element.attr("aria-describedby", this.ariaDescribedBy);
    else this.$element.removeAttr("aria-describedby");

    if (this.role) this.$element.attr("role", this.role);
    else this.$element.removeAttr("role");
  }

  public dismiss(reason: any): void {
    this._dismissListener?.(reason);
  }

  public onDismiss(listener: (reason: any) => void): void {
    this._dismissListener = listener;
  }

  public hide(): Observable<[void, void]> {
    const context: NgbTransitionOptions<any> = {
      animation: Boolean(this.animation),
      runningTransition: "stop",
    };

    const windowTransition = ngbRunTransition(
      this.$digestService,
      this.$element,
      ngbModalWindowFadeOutTransition,
      context,
    );

    if (!this._dialogEl) throw new Error("dialog element is undefined");

    const dialogTransition = ngbRunTransition(this.$digestService, this._dialogEl, noopTransition, context);

    const transitions = zip(windowTransition, dialogTransition);
    transitions.subscribe(() => {
      this.hidden.next();
      this.hidden.complete();
    });

    this._disableEventHandling();
    this._restoreFocus();

    return transitions;
  }

  public updateOptions(options: NgbModalUpdatableOptions) {
    const source: WindowOptions = options;

    this.$scope.$evalAsync(() => {
      WINDOW_ATTRIBUTES.forEach((option) => {
        if (angular.isDefined(source[option])) {
          Object.assign(this, { [option]: source[option] });
        }
      });

      this.$onChanges();
    });
  }

  private _show() {
    const context: NgbTransitionOptions<any> = {
      animation: Boolean(this.animation),
      runningTransition: "continue",
    };

    const windowTransition = ngbRunTransition(
      this.$digestService,
      this.$element,
      ngbModalWindowFadeInTransition,
      context,
    );

    if (!this._dialogEl) throw new Error("dialog element is undefined");

    const dialogTransition = ngbRunTransition(this.$digestService, this._dialogEl, noopTransition, context);

    zip(windowTransition, dialogTransition).subscribe(() => {
      this.shown.next();
      this.shown.complete();
    });

    this._enableEventHandling();
    this._setFocus();
  }

  private _setFocus() {
    const native = toNativeElement(this.$element);
    if (!native.contains(document.activeElement)) {
      const autoFocusable = native.querySelector("[ngbAutofocus]") as HTMLElement;
      const [firstFocusable] = getFocusableBoundaryElements(native);

      const elementToFocus = autoFocusable || firstFocusable || native;
      elementToFocus.focus();
    }
  }

  private _enableEventHandling() {
    this._disableEventHandling();
    const native = toNativeElement(this.$element);
    if (!this._dialogEl) throw new Error("dialog element is undefined");
    const dialog = toNativeElement(this._dialogEl);
    let preventClose = false;

    fromEvent<KeyboardEvent>(native, "keydown")
      .pipe(
        takeUntil(this._closed$),
        filter((event) => event.key === "Escape"),
      )
      .subscribe((event) => {
        this.$log.info("ngbModalWindow keydown", event);

        if (this.keyboard) {
          requestAnimationFrame(() => {
            if (!event.defaultPrevented) {
              this.$scope.$evalAsync(() => {
                this.dismiss(ModalDismissReasons.ESC);
              });
            }
          });
          return;
        }

        if (this.backdrop === "static") {
          this._bumpBackdrop();
        }
      });

    fromEvent<MouseEvent>(dialog, "mousedown")
      .pipe(
        takeUntil(this._closed$),
        tap((event) => {
          this.$log.info("ngbModalWindow dialog mousedown", event);
          preventClose = false;
        }),
        switchMap(() => fromEvent<MouseEvent>(native, "mouseup").pipe(takeUntil(this._closed$), take(1))),
        filter(({ target }) => target === native),
      )
      .subscribe((event) => {
        this.$log.info("ngbModalWindow mouseup", event);
        preventClose = true;
      });

    fromEvent<MouseEvent>(native, "click")
      .pipe(takeUntil(this._closed$))
      .subscribe((event) => {
        this.$log.info("ngbModalWindow click", event);

        if (event.target === native) {
          if (this.backdrop === "static") {
            this._bumpBackdrop();
          }

          if (this.backdrop === true && !preventClose) {
            this.$scope.$evalAsync(() => {
              this.dismiss(ModalDismissReasons.BACKDROP_CLICK);
            });
          }
        }

        preventClose = false;
      });
  }

  private _disableEventHandling() {
    this._closed$.next();
  }

  private _restoreFocus() {
    const body = document.body as HTMLBodyElement;

    const elWithFocus = this._elWithFocus;
    const validElementToFocus = elWithFocus instanceof HTMLElement && body.contains(elWithFocus);
    const elementToFocus: HTMLElement = validElementToFocus ? elWithFocus : body;

    this.$digestService.runOutsideDigest(() => elementToFocus.focus());

    this._elWithFocus = null;
  }

  private _bumpBackdrop() {
    if (this.backdrop !== "static") return;

    ngbRunTransition(this.$digestService, this.$element, ngbModalBumpBackdropTransition, {
      animation: Boolean(this.animation),
      runningTransition: "continue",
    });
  }

  static get $name() {
    return "ngbModalWindow";
  }

  static get $inject() {
    return ["$scope", "$element", DigestService.$name, "$log"];
  }

  static get $factory(): IComponentOptions {
    return {
      controller: NgbModalWindow,
      controllerAs: "$",
      template,
      bindings: {
        animation: "<?",
        ariaLabelledBy: "<?",
        ariaDescribedBy: "<?",
        backdrop: "<?",
        centered: "<?",
        fullscreen: "<?",
        keyboard: "<?",
        role: "<?",
        scrollable: "<?",
        size: "<?",
        windowClass: "<?",
        modalDialogClass: "<?",
      },
    };
  }
}
