# Migración de `ngb-js` al nuevo core

Pasar cada feature de `ngb-js` del patrón AngularJS crudo
(`static get $name` / `static get $factory` + `angular.module().directive(...)`)
a la **forma Angular moderno** sobre `ngjs-core`: clases con `@Component` /
`@Directive` / `@Injectable`, `@NgModule` por feature, `@Input` / `@Output`,
`inject()`, `host: {}`, `@ContentChild(ren)` / `@ViewChild(ren)` en vez de
`require`, hooks `ngOnInit` / `ngOnChanges` / `ngOnDestroy`.

**Referencia:** `C:\Users\maxfl\OneDrive\Desktop\ng-bootstrap-master\src` —
ng-bootstrap **v20** (Angular 21). Se replica la forma de sus clases lo más fiel
posible (nombres de métodos, inputs, `host`, `exportAs`), para que migrar de
`ngb-js` a Angular real sea después casi solo cambiar imports. El template se
mantiene en sintaxis AngularJS (regla de `ngjs-core`), no en la de Angular.

## Bloqueo de registro (resuelto)

`src/accordion/ngb-accordion.module.ts` (viejo) dependía de `"ngb.collapse"` como
string porque `NgbCollapseModule.name` daba el nombre de la clase, no el id real.
Con accordion ya migrado a `@NgModule`, el import es directo:
`imports: [CommonModule, NgbCollapseModule]` (la clase).

## Harness de specs: `test/testbed.ts`

`angular.mock.module(NgbModule.name)` a secas no cablea el `ApplicationRef`, así
que `afterNextRender(...)` (NgbToast, NgbCarousel, …) nunca se vacía y `inject()`
en field initializers no resuelve. `configureTestBed(NgbModule)` hace un
`bootstrapApplication` real sobre un host detached y expone
`$compile`/`$rootScope`/`get` + `detectChanges()` (= `appRef.tick()`: digest +
flush de `afterNextRender`). Se migran las specs a él **de a una, junto con su feature**.

## Estado (suite: 110 pasan / 38 fallan, 18/26 archivos verdes)

| Feature | Clases | `*.module.ts` | Spec | Ref |
|---|---|---|---|---|
| alert · pagination · progressbar · scrollspy | ✅ | ✅ | ✅ verde | — |
| **collapse** · **rating** · **toast** · **nav** · **modal** · **carousel** | ✅ | ✅ | ✅ verde | — |
| **tooltip** | ✅ | ✅ | ✅ 6/6 | `src/tooltip/tooltip.ts` |
| **dropdown** | ✅ (6→5 dirs, button-item fusionado) | ✅ | ✅ 3/3 | `src/dropdown/dropdown.ts` |
| **accordion** | ✅ (7 clases, 1:1 con v20) | ✅ | 🔴 0/2 — gap timing `@Input` | `src/accordion/accordion.directive.ts` |
| offcanvas | ⬜ (5, service) | ⬜ | 🔴 4/4 | `src/offcanvas/offcanvas.ts` |
| popover | ⬜ | ⬜ | 🔴 5/5 | `src/popover/popover.ts` |
| typeahead | ✅ (module sin `id:`) | ✅ | 🔴 22/22 (highlight, window, directiva) | `src/typeahead/typeahead.ts` |
| **timepicker** | ⬜ (1 componente grande) | ⬜ | ✅ verde (lógica) | `src/timepicker/timepicker.ts` |
| **datepicker** | ⬜ (10) | ⬜ | 🟡 5/13 | `src/datepicker/datepicker.ts` |

Leyenda: ✅ hecho/verde · ⬜ pendiente · 🟡 parcial · 🔴 rojo.

**Notas por feature ya migrada:**

- `tooltip`: `placement`/`triggers`/`container`/`tooltipClass` pasaron a
  `@Input({ binding: "@" })` (strings puros); `ngbTooltip` sigue `<` (es
  `string | TemplateRef`).
- `dropdown`: `NgbDropdownButtonItem` fusionado en `NgbDropdownItem` (host
  `disabled` solo si `<button>`); `NgbDropdown` sin template (light DOM);
  `ngbAutoClose` a la firma v20; `afterNextRender` en vez de `queueMicrotask`;
  `@HostListener("keydown.*")` en menu/toggle.
- `accordion`: **portado 1:1 al `accordion.directive.ts` de v20**, un archivo por
  directiva (convención de `ngb-js`). `hostDirectives` ✅ (lo cablea
  `host-directives-bridge.ts` de `ngjs-core`). Sigue rojo 2/2 por otro gap de
  timing: `@Input() set collapsed` lee un `@ContentChild` estático que
  `ngjs-core` todavía no resolvió al aplicar el binding (ver CORE_GAPS), y falta
  revisar el `ViewContainerRef` del `NgbAccordionBody`. `disabled` del item es
  `@Input() disabled` (es un `<div>`, sin choque con el atributo nativo); el
  `[disabled]` del `<button>` va por `@HostBinding`. `<ng-container #container />`
  → `<ng-container ng-ref="container" ng-ref-read="viewContainerRef">`.
  `@Injectable({ providedIn:"root" })` en el config. Spec a `configureTestBed`.

## Bugs de `ngjs-core` encontrados y arreglados

1. **`ngOnInit` no disparaba con `@Output` presente** (`5c99a27`) —
   `output-emitter-bridge` dejaba `$onInit` puesto antes que `lifecycle-bridge`,
   que lo salteaba. Fix: encadenar.
2. **`TemplateRef`/`NgTemplateOutlet` copiaban el contexto por valor** (`9835b30`)
   — mutación in-place del contexto (`NgbRating`, `NgbCarousel`) no se reflejaba.
   Fix: `let-x` son getters en vivo, el outlet pasa por referencia.
3. **`inject()` sin fallback estilo `require`** (`41725c8`) — ahora una directiva
   del host o un ancestro se resuelve con `$element.controller(name)`.
4. **`@ContentChild`/`@ContentChildren` sobre `@Directive` sin template** (`e577104`)
   — antes solo para componentes con `<ng-content>`. Ahora light DOM del host.
5. **`controllerAs` de `@Directive` compartido** (`e577104`) — heredaba el `"$"` del
   `@NgModule`, colisión en el scope. Ahora nombre de registro único por directiva
   (sin template propio).
6. **`exportAs` era metadata muerta** (`ca0ad2b`) — `ng-ref-read` ahora resuelve
   `exportAs` + tokens sintéticos (`ElementRef`/`TemplateRef`/`ViewContainerRef`),
   `$element`/`ngTemplate` deprecados.
7. **`@Input()` no aceptaba valor literal de atributo** (sin commit) — `@Input()`
   siempre registraba binding `<?` (expresión), así que `placement="top left"`
   se evaluaba como expresión y `$parse` tiraba con espacios/puntuación. Ahora
   `@Input({ binding: "@" })` registra `@?` (string literal / interpolación),
   igual que `@Input()` de Angular usado como `attr="valor"`. Sin heurística:
   el autor declara el modo. Un input `string | TemplateRef` se deja en `<` y
   el string se pasa entrecomillado (`ngb-tooltip="'Texto'"`).
8. **`@HostListener` sin pseudo-eventos de tecla** (sin commit) — no se podía
   `@HostListener("keydown.arrowdown")` / `("keydown.shift.tab")` (registraba
   `addEventListener("keydown.arrowdown")`, nunca dispara). Ahora `ngjs-core`
   parsea el sufijo con el mismo álgebra que el `KeyEventsPlugin` de Angular
   (`<evento>.<modificador...>.<tecla>`, `KeyboardEvent.key` en minúsculas,
   `alt`/`control`/`meta`/`shift` en cualquier orden) — ver
   `core/metadata/host-listener-key.ts`. Usado por `NgbDropdownMenu` /
   `NgbDropdownToggle`.
9. **`ngAfterContentChecked` / `ngAfterViewChecked` no se reenviaban** (sin
   commit) — ahora van a `$doCheck`, en orden tras `ngDoCheck`, encadenados.
   Usado por `NgbAccordionBody`.
10. **`hostDirectives` no estaba soportado** (sin commit) — ahora
    `runtime/bridges/host-directives-bridge.ts` (decorador de `$controller` más
    externo) instancia cada directiva compuesta sobre el `$element` del host
    antes de construirlo, la pasa por toda la cadena de bridges, la publica en
    `$element.data("$<sel>Controller")` para `inject()`, y le corre el ciclo de
    vida a mano. Sin reenvío de `inputs`/`outputs` largos. Usado por `accordion`.

## Adaptaciones en `ngb-js` (no en el core)

- **Directivas con selector solapado fusionadas** (AngularJS no admite dos con el
  mismo nombre y controller): `NgbNavItemRole`→`NgbNavItem`,
  `NgbNavLink`/`NgbNavLinkButton`→`NgbNavLinkBase` (ramifica por `tagName`),
  `NgbDropdownButtonItem`→`NgbDropdownItem` (host `disabled` solo si `<button>`).
  `NgbDropdownToggle` sí queda aparte: distinto nombre de atributo
  (`[ngbDropdownToggle]` vs `[ngbDropdownAnchor]`), y `@ContentChild(NgbDropdownAnchor)`
  lo matchea porque `extends NgbDropdownAnchor` (los tokens de query suben la
  cadena de prototipos — no hace falta `useExisting`).
- **`NgbDropdown` sin template** (ng-bootstrap tampoco tiene): `@ContentChild`/
  `@ContentChildren` sobre `@Directive` sin template = light DOM (bug #4 del core).
- **`NgbRootModule` importa `PlatformBrowserModule`** → token `DOCUMENT`.
- **`toNativeElement`** restaurado en `utils` (9 componentes viejos lo usan).
- **`@HostListener` usa `addEventListener`**, no jqLite `.on()` — las specs deben
  disparar con `dispatchEvent(new MouseEvent(...))`, no `triggerHandler`.

## Orden

1. ~~collapse~~ · ~~rating~~ · ~~toast~~ · ~~modal~~ · ~~carousel~~ · ~~nav~~ ✅
2. ~~tooltip~~ ✅ 6/6 (module `id:` + `NgbTooltipWindow` + `CommonModule`;
   rapid-switch `.show` con `drain()`; `@Input({ binding: "@" })` para strings).
3. ~~dropdown~~ ✅ 3/3 (6 dirs → 5 + `NgbDropdownButtonItem` fusionado; module
   `@NgModule`; spec a `configureTestBed`; `ngbAutoClose` a la firma v20;
   `afterNextRender` en vez de `queueMicrotask`; `@HostListener("keydown.*")`).
4. ~~accordion~~ portado 1:1 a v20; `hostDirectives` ✅. Sigue 0/2 por el gap de
   timing de `@Input` (setter que lee `@ContentChild` estático) + revisar el
   `ViewContainerRef` del body — a resolver en el core.
5. **offcanvas** → **popover** → **typeahead** → **datepicker**.

Tras cada uno: `bunx vitest run src/<feature>` verde + suite completa sin nuevos rojos.

## Pendiente en `ngjs-core` (resolver al final)

- **Timing de `@Input` de `@Directive`** — `ngjs-core` aplica el valor `<`
  inicial en el link (antes de linkear los hijos); Angular lo aplica en el CD del
  host (después de crear el contenido y resolver las queries `{ static: true }`).
  Un `@Input set` que lee un `@ContentChild`/`@ViewChild` estático lo ve
  `undefined`. Bloquea `NgbAccordionItem.set collapsed`. Fix: diferir el valor
  inicial de los `<`/`=` de una `@Directive` al primer `$digest` post-link.
- **`ViewContainerRef` de `NgbAccordionBody`** — el `<ng-template>` no se
  inserta; revisar `@ViewChild("container", { read: ViewContainerRef })` +
  `@ContentChild(TemplateRef, { static: true })` sobre un `@Component` de
  atributo con `transclude`.

## Receta por módulo

1. Abrir la ref (`ng-bootstrap-master/src/<feature>/`), leer la(s) clase(s).
2. Por cada clase `static $name/$factory`:
   - `@Directive({ selector: "[ngbX]" })` / `@Component({ selector, template, host })`.
     El `restrict:"A"` de hoy → selector de atributo `[ngbX]`; `"E"` → tag.
   - `require: { foo: "^^ngbFoo" }` → `@ContentChild` / `@Input` inyectado, o
     `inject()` del padre según la ref.
   - `bindToController` inputs → `@Input()` (alias con `@Input("ngbX")` si aplica).
   - `$element.on(...)` / `$element.attr/addClass` → `@HostListener` / `@HostBinding`
     / `host: {}` como en la ref.
   - `$scope.$watch` → `ngOnChanges` o `@Input set`.
   - `constructor($element, $scope)` → `inject(ElementRef)` en field initializer.
   - `$onInit/$postLink/$onDestroy` → `ngOnInit` / `ngAfterViewInit` / `ngOnDestroy`.
3. `*.module.ts`: `angular.module("ngb.x", [...])` + `.directive()/.service()` →
   ```ts
   @NgModule({
     id: "ngb.x",
     imports: [/* otros @NgModule clase, NO .name */],
     declarations: [/* las clases */],
     providers: [NgbXConfig],
   })
   export class NgbXModule {}
   ```
   Quitar el `registerNgModule` suelto si lo hubiera (solo lo hace `ngb.module.ts`).
4. `ngb.module.ts`: cambiar `NgbXModule.name` → `NgbXModule` (clase) en `imports`.
5. Specs: si hacían `angular.mock.module("ngb.x")` string → `NgbXModule.name` sigue
   valiendo (es la prop del `angular.module` que crea `registerNgModule`); no debería
   hacer falta tocarlas salvo aserciones de estructura.
6. Gaps del core: anotarlos en `CORE_GAPS.md`, no meter adaptadores en la lib.
