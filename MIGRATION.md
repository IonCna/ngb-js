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

`src/ngb.module.ts` hace un único `registerNgModule(NgbRootModule)` que camina el
grafo de `@NgModule`. `src/accordion/ngb-accordion.module.ts` (viejo) dependía de
`NgbCollapseModule.name` — pero `NgbCollapseModule` es una **clase** `@NgModule`,
así que `.name` daba `"NgbCollapseModule"` en vez del id real `"ngb.collapse"`.
Eso rompía `NgbModule` entero en cascada. **Puente aplicado:** la dep pasó a la
string `"ngb.collapse"` (se revierte a `imports: [NgbCollapseModule]` al migrar
accordion). Los otros 7 modules viejos solo dependen de `CommonModule.name`
(= `"ng.js.common"`), que sí resuelve.

Con el puente, `NgbModule` carga. Los rojos que quedan son **fallos de comportamiento
reales** por migración incompleta, no de registro.

## Estado (suite: 85 pasan / 63 fallan, 10/26 archivos verdes)

| Feature | Clases | `*.module.ts` | Spec | Ref |
|---|---|---|---|---|
| alert | ✅ `@Component` | ✅ `@NgModule` | ✅ verde | `src/alert/alert.ts` |
| pagination | ✅ | ✅ | ✅ verde | `src/pagination/pagination.ts` |
| progressbar | ✅ | ✅ | ✅ verde | `src/progressbar/progressbar.ts` |
| scrollspy | ✅ | ✅ | ✅ verde | `src/scrollspy/scrollspy.ts` |
| collapse | ✅ | ✅ | 🟡 2/4 fallan | `src/collapse/collapse.ts` |
| rating | ✅ | ✅ | 🟡 2/4 fallan | `src/rating/rating.ts` |
| toast | ✅ | ✅ | 🟡 1/2 fallan | `src/toast/toast.ts` |
| nav | ✅ | ✅ | 🔴 4/4 fallan | `src/nav/nav.ts` |
| tooltip | ✅ | ✅ | 🔴 6/6 fallan | `src/tooltip/tooltip.ts` |
| typeahead | ✅ | ✅ | 🔴 22/22 fallan | `src/typeahead/typeahead.ts` |
| **carousel** | ⬜ `static $factory` | ⬜ `angular.module` | 🔴 6/6 | `src/carousel/carousel.ts` |
| **popover** | ⬜ | ⬜ | 🔴 5/5 | `src/popover/popover.ts` |
| **accordion** | ⬜ (8 directivas) | ⬜ (puente) | 🔴 2/2 | `src/accordion/accordion.directive.ts` |
| **dropdown** | ⬜ (7) | ⬜ | 🔴 3/3 | `src/dropdown/dropdown.ts` |
| **modal** | ⬜ (5, service) | ⬜ | 🟡 1/4 fallan | `src/modal/modal.ts` |
| **offcanvas** | ⬜ (5, service) | ⬜ | 🔴 4/4 | `src/offcanvas/offcanvas.ts` |
| **timepicker** | ⬜ (1 componente grande) | ⬜ | ✅ verde (lógica; sin spec de componente) | `src/timepicker/timepicker.ts` |
| **datepicker** | ⬜ (10) | ⬜ | 🟡 5/13 fallan (lógica verde) | `src/datepicker/datepicker.ts` |

Leyenda: ✅ hecho/verde · ⬜ pendiente · 🟡 parcial · 🔴 rojo.

## Orden propuesto

Primero cerrar los que están cerca (migrados, pocos rojos), después los migrados
rotos, después los viejos:

1. **collapse** — migrada, 2 rojos. Patrón de debugging.
2. **rating** — migrada, 2 rojos (proyección de `TemplateRef` + click).
3. **toast** — migrada, 1 rojo (semántica host).
4. **modal** — 1 rojo (razón de dismiss con Escape); después migrar el module.
5. **nav** — migrada, 4 rojos (`ng-ref-read`, herencia de token, outlet).
6. **tooltip** — migrada, 6 rojos (popup lifecycle, transiciones).
7. **typeahead** — migrada, 22 rojos (highlight, window, directiva).
8. **carousel** → **popover** → **accordion** → **dropdown** → **offcanvas** →
   **timepicker** (componente) → **datepicker** — old→new completo.

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
