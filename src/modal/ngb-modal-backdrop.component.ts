import type { NgbModalUpdatableOptions } from "@ngb/modal/ngb-modal-config.service";
import { isDefined, ngbRunTransition, reflow } from "@ngb/utils";
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
  type OnInit,
} from "ngjs-core";
import type { Observable } from "rxjs";

const BACKDROP_ATTRIBUTES = ["animation", "backdropClass"] as const;

@Component({
  selector: "ngb-modal-backdrop",
  template: "",
})
export class NgbModalBackdrop implements OnInit {
  private _nativeElement = inject(ElementRef).nativeElement as HTMLElement;
  private _zone = inject(NgZone);
  private _injector = inject(Injector);
  private _cdRef = inject(ChangeDetectorRef);

  @Input() animation!: boolean;
  @Input({ binding: "@" }) backdropClass!: string;

  @HostBinding("class")
  get _hostClass(): string {
    return `modal-backdrop${this.backdropClass ? ` ${this.backdropClass}` : ""}`;
  }

  @HostBinding("class.show")
  get _show(): boolean {
    return !this.animation;
  }

  @HostBinding("class.fade")
  get _fade(): boolean {
    return this.animation;
  }

  @HostBinding("style.z-index")
  readonly _zIndex = 1055;

  ngOnInit() {
    afterNextRender(
      {
        mixedReadWrite: () =>
          ngbRunTransition(
            this._zone,
            this._nativeElement,
            (element: HTMLElement, animation: boolean) => {
              if (animation) {
                reflow(element);
              }
              element.classList.add("show");
            },
            { animation: this.animation, runningTransition: "continue" },
          ),
      },
      { injector: this._injector },
    );
  }

  hide(): Observable<void> {
    return ngbRunTransition(this._zone, this._nativeElement, ({ classList }) => classList.remove("show"), {
      animation: this.animation,
      runningTransition: "stop",
    });
  }

  updateOptions(options: NgbModalUpdatableOptions) {
    for (const optionName of BACKDROP_ATTRIBUTES) {
      if (isDefined((options as Record<string, unknown>)[optionName])) {
        (this as Record<string, unknown>)[optionName] = (options as Record<string, unknown>)[optionName];
      }
    }
    this._cdRef.markForCheck();
  }

  static get $name() {
    return "ngbModalBackdrop";
  }
}
