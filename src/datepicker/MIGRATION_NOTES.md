# Datepicker → decoradores: pendientes ("resolver al final")

Estado: 8 archivos migrados a `@Component`/`@Directive`/`@Injectable`/`@NgModule`,
1-1 con ng-bootstrap-master en lo posible. Suite: 468/480 (antes 463/480).

## 0. `ngb-datepicker.component.ts` — reescrito al idioma ngjs-core (HECHO)

- `implements ControlValueAccessor` + `providers: [{ provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => NgbDatepicker), multi: true }]` → el
  `control-value-accessor-bridge` conecta con `ngModel`. Se sacó `require:
  { ngModelCtrl, ngDisabled }` y el hijack manual de `ngModelCtrl.$render`.
- subs con `takeUntilDestroyed(inject(DestroyRef))` (sin `ngOnDestroy`).
- `@ViewChild("content", { read: ElementRef, static: true })` + `fromEvent`/`merge`/
  `filter` para el foco de la months view (1-1 upstream).
- `focus()` con `afterNextRender({ read }, { injector })` (1-1 upstream).
- `i18n` = getter sobre `inject(NgbDatepickerI18n)`; `inject(Injector/DestroyRef/
  NgZone/ChangeDetectorRef/NgbDatepickerConfig)`.
- `@HostBinding("class.disabled")` (sin `classList.toggle` imperativo).
- `dayTemplate` fallback movido a `ngAfterContentInit` (en ngjs-core el
  `@ViewChild({static:true})` resuelve en `$postLink`, no antes de `ngOnInit`).

Divergencias que quedan (spec-driven / sin equivalente en core, ver §3):
`@Input() calendar`/`dateAdapter` + recreación del service en `changes.calendar`;
`NgbDatepickerService` instanciado a mano con `($locale,$filter,calendar,i18n)`;
`@Input({binding:"@"})` en `navigation`/`outsideDays`; `static get $name()`.

## 1. `ngb-input-datepicker.directive.ts`

HECHO: `PopupService` (1 arg + `inject()`), `ngbAutoClose` (firma nueva),
`ngbPositioning()` (sin arg), `open()` async sin `$q`. **DI 100% por `inject()`**:
sin constructor, sin `static $inject` — `inject(ElementRef).nativeElement`,
`inject(DOCUMENT)`, `inject(NgZone)`, `inject(ChangeDetectorRef)`,
`inject(NgbInputDatepickerConfig)`, `inject("$scope")`. Los `$element.on/off`
pasaron a `_nativeElement.addEventListener/removeEventListener`. Typecheck limpio,
pasan los 3 tests de popup.

`NgbDatepickerI18nDefault` también: `inject("$locale")`/`inject("$filter")` como
fallback cuando el constructor se llama sin args (path `useClass` / `new` en
contexto); mantiene los params opcionales para `NgbDatepickerService` y los stubs
de test.

PENDIENTE — `formats model values and toggles a popup with custom class`:
`[object Object]` en `input.value`. ngb-js hijackea `ngModelCtrl.$render`;
ng-bootstrap es `ControlValueAccessor` puro (`NG_VALUE_ACCESSOR`). El render
inicial pierde la carrera con el `$render` del `input` nativo. Fix real = portar
el directive a CVA como `NgbTypeahead` (`providers: [{ provide: NG_VALUE_ACCESSOR,
useExisting: forwardRef(() => NgbInputDatepicker), multi: true }]` + implementar
`ControlValueAccessor`).

## 2. `ngb-datepicker-calendars.spec.ts` — 9 fallos, es el SPEC el que no es 1-1

El código de los calendarios es idéntico byte a byte a ng-bootstrap. El spec
(archivo nuevo de la migración, ng-bootstrap testea per-calendario) asume:
- `getPrev(getNext(d, "y"), "y")` reversible → falso: hijri/jalali/etc. resetean
  `month=1; day=1` al navegar por año (a propósito, igual que upstream).
- `isValid(new NgbDate(y, 0, 1)) === false` → el `isValid` de hijri es laxo.
→ Aflojar esas aserciones o traer los specs per-calendario de ng-bootstrap.

## 3. Gaps de ngjs-core encontrados (no bloqueantes, con workaround)

- **`providers` a nivel `@Component`/`@Directive` no se cablean**
  (`buildComponentOptions`/`buildDirectiveDefinition` ignoran `def.providers`).
  ng-bootstrap: `NgbDatepicker` provee `NgbDatepickerService`; `NgbDatepickerMonth`
  hace `inject(NgbDatepickerService)`. Workaround: `NgbDatepicker` instancia el
  service adentro y `NgbDatepickerMonth` delega vía `inject(NgbDatepicker)`.
- **`inject(TemplateRef)` desde `@Directive` sobre `<ng-template>` no resuelve**
  (Gap B / CORE_GAPS). `NgbDatepickerContent` quedó marker vacío; el `TemplateRef`
  lo lee `NgbDatepicker` con `@ContentChild(NgbDatepickerContent, { read: TemplateRef })`.
- **DI jerárquica de directivas NO atraviesa contenido proyectado**
  (`ngTemplateOutlet` con contexto). `NgbDatepickerMonth` cae a un scope-walk
  cuando `inject(NgbDatepicker)` da null (template de contenido custom).
- **`@Inject("$locale")` en constructor sin `emitDecoratorMetadata`** → `$inject = []`
  (bug en `applyConstructorInject`: mapea sobre `paramTypes` vacío ignorando los
  overrides). Workaround: `inject("$locale")` en field initializer, o
  `static get $inject()`.
- **Sin `formatDate` / `LOCALE_ID` provisto** en módulo suelto → `NgbDatepickerI18nDefault`
  sigue con `$locale` / `$filter` de AngularJS en vez de `inject(LOCALE_ID)` + `formatDate`.

## 4. Fuera de datepicker

- `config-services.spec.ts` (2 fallos): `NgbModalConfig`/`NgbOffcanvasConfig` no
  registrados como providers + propagación de `animation` desde `NgbConfig`.
- `ngb-popover.directive.ts` y `ngb-scrollspy-menu.directive.ts` tienen el mismo
  drift que tenía el datepicker (`NgbPositioning` import, `PopupService` 4-arg,
  `ngbPositioning(rtl)`, `ngbAutoClose` firma vieja) → rompen `tsc -p
  tsconfig.build.json` (el bundle esbuild sí compila). Aplicar el mismo fix que
  se hizo en `ngb-input-datepicker.directive.ts`.
