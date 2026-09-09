import { NgbAccordionDirective } from "@ngb/accordion/ngb-accordion.directive";
import { NgbAccordionCollapse } from "@ngb/accordion/ngb-accordion-collapse.directive";
import { isString } from "@ngb/utils";
import {
  ChangeDetectorRef,
  ContentChild,
  DestroyRef,
  Directive,
  EventEmitter,
  HostBinding,
  Input,
  inject,
  Output,
} from "ngjs-core";
import { takeUntilDestroyed } from "ngjs-core/rxjs-interop";

let nextId = 0;

/**
 * Directiva que envuelve un item del acordeón: header toggleable + body que
 * colapsa.
 *
 * Se puede tomar la instancia de `NgbAccordionItem` en el template con
 * `#item="ngbAccordionItem"`. Permite ver si el item está colapsado, alternarlo, etc.
 *
 * Cada item tiene un id string autogenerado con formato `ngb-accordion-item-XX`,
 * salvo que se dé explícitamente.
 *
 * @since 14.1.0
 */
@Directive({
  selector: "[ngbAccordionItem]",
  exportAs: "ngbAccordionItem",
})
export class NgbAccordionItem {
  private _accordion = inject(NgbAccordionDirective);
  private _cd = inject(ChangeDetectorRef);
  private _destroyRef = inject(DestroyRef);

  private _collapsed = true;
  private _id = `ngb-accordion-item-${nextId++}`;
  private _destroyOnHide: boolean | undefined;

  private _collapseAnimationRunning = false;

  @ContentChild(NgbAccordionCollapse, { static: true })
  private _collapse!: NgbAccordionCollapse;

  @HostBinding("id")
  get _hostId(): string {
    return this.id;
  }

  @HostBinding("class.accordion-item")
  readonly _hostClass = true;

  /**
   * Setea el ID custom del item del acordeón. Debe ser único en el documento.
   */
  @Input("ngbAccordionItem") set id(id: string) {
    if (isString(id) && id !== "") {
      this._id = id;
    }
  }

  /**
   * Si es `true`, el contenido del body del item se quita del DOM (si no, solo
   * se oculta). Se puede setear también en la directiva `NgbAccordion` padre.
   *
   * @defaultValue `true` — se inicializa desde el `NgbAccordion` padre
   */
  @Input() set destroyOnHide(destroyOnHide: boolean) {
    this._destroyOnHide = destroyOnHide;
  }

  get destroyOnHide(): boolean {
    return this._destroyOnHide === undefined ? this._accordion.destroyOnHide : this._destroyOnHide;
  }

  /**
   * Si es `true`, el item del acordeón queda deshabilitado. No reacciona a los
   * clicks del usuario, pero se puede alternar programáticamente.
   */
  @Input() disabled = false;

  /**
   * Si es `true`, el item arranca colapsado. Si no, expandido.
   *
   * @defaultValue `true`
   */
  @Input() set collapsed(collapsed: boolean) {
    if (collapsed) {
      this.collapse();
    } else {
      this.expand();
    }
  }

  /** Evento emitido antes de arrancar la animación de expansión. Sin payload. @since 15.1.0 */
  @Output() show = new EventEmitter<void>();

  /** Evento emitido cuando termina la animación de expansión. Sin payload. */
  @Output() shown = new EventEmitter<void>();

  /** Evento emitido antes de arrancar la animación de colapso. Sin payload. @since 15.1.0 */
  @Output() hide = new EventEmitter<void>();

  /** Evento emitido al terminar el colapso y antes de sacar el contenido del DOM. Sin payload. */
  @Output() hidden = new EventEmitter<void>();

  get collapsed(): boolean {
    return this._collapsed;
  }

  get id(): string {
    return `${this._id}`;
  }

  get toggleId(): string {
    return `${this.id}-toggle`;
  }

  get collapseId(): string {
    return `${this.id}-collapse`;
  }

  get _shouldBeInDOM(): boolean {
    return !this.collapsed || this._collapseAnimationRunning || !this.destroyOnHide;
  }

  ngAfterContentInit(): void {
    const { ngbCollapse } = this._collapse;
    // hay que deshabilitar la animación en el primer init
    ngbCollapse.animation = false;
    ngbCollapse.collapsed = this.collapsed;
    // seteamos la animación al default del acordeón
    ngbCollapse.animation = this._accordion.animation;
    // reenvío de eventos de 'ngbCollapse' a 'ngbAccordion'
    ngbCollapse.hidden.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(() => {
      // al terminar la animación podemos sacar el template del DOM
      this._collapseAnimationRunning = false;
      this.hidden.emit();
      this._accordion.hidden.emit(this.id);
      this._cd.markForCheck();
    });
    ngbCollapse.shown.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(() => {
      this.shown.emit();
      this._accordion.shown.emit(this.id);
      this._cd.markForCheck();
    });
  }

  /** Alterna un item del acordeón. */
  toggle(): void {
    this.collapsed = !this.collapsed;
  }

  /** Expande un item del acordeón. */
  expand(): void {
    if (this.collapsed) {
      // chequeamos si el acordeón permite expandir respecto de 'closeOthers'
      if (!this._accordion._ensureCanExpand(this)) {
        return;
      }

      this._collapsed = false;

      this._cd.markForCheck();

      // forzamos CD para meter el template en el DOM antes de arrancar la
      // animación y poder medir su alto correctamente
      this._cd.detectChanges();

      // disparamos eventos antes de las animaciones
      this.show.emit();
      this._accordion.show.emit(this.id);

      // aseguramos que el flag 'animation' esté al día
      this._collapse.ngbCollapse.animation = this._accordion.animation;
      this._collapse.ngbCollapse.collapsed = false;
    }
  }

  /** Colapsa un item del acordeón. */
  collapse(): void {
    if (!this.collapsed) {
      this._collapsed = true;
      this._collapseAnimationRunning = true;

      this._cd.markForCheck();

      // disparamos eventos antes de las animaciones
      this.hide.emit();
      this._accordion.hide.emit(this.id);

      // aseguramos que el flag 'animation' esté al día
      this._collapse.ngbCollapse.animation = this._accordion.animation;
      this._collapse.ngbCollapse.collapsed = true;
    }
  }
}
