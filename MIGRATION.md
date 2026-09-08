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

## Bloqueo de registro (resuelto con puente)

`src/accordion/ngb-accordion.module.ts` (viejo) dependía de `NgbCollapseModule.name`
— pero es una **clase** `@NgModule`, así que `.name` daba `"NgbCollapseModule"` en
vez del id real `"ngb.collapse"`, y rompía `NgbModule` en cascada. Puente: la dep
pasó a `"ngb.collapse"` (se revierte a `imports: [NgbCollapseModule]` al migrar
accordion).

## Harness de specs: `test/testbed.ts`

`angular.mock.module(NgbModule.name)` a secas no cablea el `ApplicationRef`, así
que `afterNextRender(...)` (NgbToast, NgbCarousel, …) nunca se vacía y `inject()`
en field initializers no resuelve. `configureTestBed(NgbModule)` hace un
`bootstrapApplication` real sobre un host detached y expone
`$compile`/`$rootScope`/`get` + `detectChanges()` (= `appRef.tick()`: digest +
flush de `afterNextRender`). Se migran las specs a él **de a una, junto con su feature**.

## Estado (suite: 104 pasan / 44 fallan, 16/26 archivos verdes)

| Feature | Clases | `*.module.ts` | Spec | Ref |
|---|---|---|---|---|
| alert · pagination · progressbar · scrollspy | ✅ | ✅ | ✅ verde | — |
| **collapse** · **rating** · **toast** · **nav** · **modal** · **carousel** | ✅ | ✅ | ✅ verde | — |
| tooltip | ✅ | ✅ (sin `id:`) | 🟡 4/6 | `src/tooltip/tooltip.ts` |
| dropdown | ⬜ (7) | ⬜ `angular.module` | 🟡 2/3 | `src/dropdown/dropdown.ts` |
| accordion | ⬜ (8 directivas) | ⬜ (puente) | 🔴 2/2 | `src/accordion/accordion.directive.ts` |
| offcanvas | ⬜ (5, service) | ⬜ | 🔴 4/4 | `src/offcanvas/offcanvas.ts` |
| popover | ⬜ | ⬜ | 🔴 5/5 | `src/popover/popover.ts` |
| typeahead | ✅ (module sin `id:`) | ✅ | 🔴 22/22 (highlight, window, directiva) | `src/typeahead/typeahead.ts` |
| **timepicker** | ⬜ (1 componente grande) | ⬜ | ✅ verde (lógica) | `src/timepicker/timepicker.ts` |
| **datepicker** | ⬜ (10) | ⬜ | 🟡 5/13 | `src/datepicker/datepicker.ts` |

Leyenda: ✅ hecho/verde · ⬜ pendiente · 🟡 parcial · 🔴 rojo.

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

## Adaptaciones en `ngb-js` (no en el core)

- **Directivas con selector solapado fusionadas** (AngularJS no admite dos con el
  mismo nombre y controller): `NgbNavItemRole`→`NgbNavItem`,
  `NgbNavLink`/`NgbNavLinkButton`→`NgbNavLinkBase` (ramifica por `tagName`).
- **`NgbRootModule` importa `PlatformBrowserModule`** → token `DOCUMENT`.
- **`toNativeElement`** restaurado en `utils` (9 componentes viejos lo usan).
- **`@HostListener` usa `addEventListener`**, no jqLite `.on()` — las specs deben
  disparar con `dispatchEvent(new MouseEvent(...))`, no `triggerHandler`.

## Orden

1. ~~collapse~~ · ~~rating~~ · ~~toast~~ · ~~modal~~ · ~~carousel~~ · ~~nav~~ ✅
2. **tooltip** — 2 rojos. Homogeneizar `id:` del module a `"ngb.tooltip"`.
3. **dropdown** — 2 rojos + migrar el module.
4. **accordion** → **offcanvas** → **popover** → **typeahead** → **datepicker**.

Tras cada uno: `bunx vitest run src/<feature>` verde + suite completa sin nuevos rojos.

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
