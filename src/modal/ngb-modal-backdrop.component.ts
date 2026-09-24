import type { NgbModalUpdatableOptions } from "@ngb/modal/ngb-modal-config.service";
import { isDefined, ngbRunTransition, reflow } from "@ngb/utils";
import { ChangeDetectorRef, Component, ElementRef, HostBinding, inject, Input, NgZone, type OnInit } from "ngjs-core";
import type { Observable } from "rxjs";
import { take } from "rxjs/operators";

const BACKDROP_ATTRIBUTES = ["animation", "backdropClass"] as const;

@Component({
  selector: "ngb-modal-backdrop",
  template: "",
})
export class NgbModalBackdrop implements OnInit {
  private _nativeElement = inject(ElementRef).nativeElement as HTMLElement;
  private _zone = inject(NgZone);
  private _cdRef = inject(ChangeDetectorRef);

  @Input() animation!: boolean;
  @Input({ binding: "@" }) backdropClass!: string;

  @HostBinding("class")
  get _hostClass(): string {
    return `modal-backdrop${this.backdropClass ? ` ${this.backdropClass}` : ""}`;
  }

  @HostBinding("class.fade")
  get _fade(): boolean {
    return this.animation;
  }

  @HostBinding("style.z-index")
  readonly _zIndex = 1055;

  ngOnInit() {
    // `.show` es puramente imperativo (no `@HostBinding`, a propósito — mismo
    // criterio que `NgbModalWindow`): `createComponent` acá es async (ver
    // CORE_GAPS), así que el primer `$digest` de ESTE componente puede correr
    // en un tick posterior al que dispara `afterNextRender` (que es global,
    // vía `ApplicationRef.tick()`). Si `.show` fuera un `@HostBinding` atado a
    // `!animation`, su PRIMER `$watch` (que siempre corre una vez, sea cual
    // sea el valor) pisaría el `.show` que ya puso `classList.add` acá abajo —
    // el backdrop queda en el DOM pero invisible (bug real, visto con
    // `animation` en su default `true`).
    //
    // `afterAttachedRender` (no `afterNextRender` a secas): el elemento sigue
    // DESCONECTADO del documento en este punto (`createComponent` acá es
    // async — el stack service recién hace `appendChild` más tarde, en su
    // propio `.then()`). Si el próximo `tick()` global cae antes de eso, el
    // `reflow()`+`.show` de abajo corren sobre un nodo que el browser nunca
    // pintó: no hay "antes" que animar y el fade queda pegado al estado final
    // (mismo bug, pero de la ANIMACIÓN en sí, no de la clase).
    this._zone.onStable.pipe(take(1)).subscribe(() => {
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
      );
    });
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
