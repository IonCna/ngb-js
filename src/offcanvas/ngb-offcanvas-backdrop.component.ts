import type { NgbOffcanvasUpdatableOptions } from "@ngb/offcanvas/ngb-offcanvas-config.service";
import { OffcanvasDismissReasons } from "@ngb/offcanvas/ngb-offcanvas-dismiss-reasons";
import { ngbOffcanvasFadeInTransition, ngbOffcanvasFadeOutTransition } from "@ngb/offcanvas/ngb-offcanvas-transition";
import { isDefined, ngbRunTransition } from "@ngb/utils";
import {
  afterNextRender,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  inject,
  Injector,
  Input,
  NgZone,
  type OnDestroy,
  type OnInit,
} from "ngjs-core";
import { defaultIfEmpty, fromEvent, type Observable, Subject, takeUntil } from "rxjs";

const BACKDROP_ATTRIBUTES = ["animation", "backdropClass"] as const;

@Component({
  selector: "ngb-offcanvas-backdrop",
  template: "",
})
export class NgbOffcanvasBackdrop implements OnInit, OnDestroy {
  private _nativeElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private _zone = inject(NgZone);
  private _injector = inject(Injector);
  private _cdRef = inject(ChangeDetectorRef);

  @Input() animation?: boolean;
  @Input({ binding: "@" }) backdropClass?: string;

  /** Lo pone `NgbOffcanvasStack` según `options.backdrop === "static"`. */
  static?: boolean;
  /** Lo asigna `NgbOffcanvasRef`. */
  onDismiss?: (arg: { $event: OffcanvasDismissReasons }) => void;

  private _destroyed$ = new Subject<void>();

  @HostBinding("class")
  get _hostClass(): string {
    return `offcanvas-backdrop${this.backdropClass ? ` ${this.backdropClass}` : ""}`;
  }

  @HostBinding("class.fade")
  get _fade(): boolean {
    return this.animation ?? true;
  }

  ngOnInit(): void {
    const animation = this.animation ?? true;
    afterNextRender(
      {
        mixedReadWrite: () =>
          ngbRunTransition(this._zone, this._nativeElement, ngbOffcanvasFadeInTransition, {
            animation,
            runningTransition: "continue",
          }),
      },
      { injector: this._injector },
    );

    this._zone.runOutsideAngular(() => {
      fromEvent<MouseEvent>(this._nativeElement, "mousedown")
        .pipe(takeUntil(this._destroyed$))
        .subscribe(() => this._zone.run(() => this.dismiss()));
    });
  }

  ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

  hide(): Observable<void> {
    return ngbRunTransition(this._zone, this._nativeElement, ngbOffcanvasFadeOutTransition, {
      animation: this.animation ?? true,
      runningTransition: "stop",
    }).pipe(defaultIfEmpty(undefined)) as Observable<void>;
  }

  dismiss(): void {
    if (this.static) return;
    this.onDismiss?.({ $event: OffcanvasDismissReasons.BACKDROP_CLICK });
  }

  updateOptions(options: NgbOffcanvasUpdatableOptions): void {
    for (const attr of BACKDROP_ATTRIBUTES) {
      if (isDefined((options as Record<string, unknown>)[attr])) {
        (this as Record<string, unknown>)[attr] = (options as Record<string, unknown>)[attr];
      }
    }
    this._cdRef.markForCheck();
  }

  static get $name() {
    return "ngbOffcanvasBackdrop";
  }
}
