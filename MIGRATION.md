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

## Análisis del harness (en curso — iterar acá)

Por qué las features **migradas** siguen rojas: no es la conversión de cada
módulo, es cómo arrancan las specs. Patrón actual de toda spec de `ngb-js`:

```ts
angular.mock.module(NgbModule.name);            // NgbModule = registerNgModule(NgbRootModule)
angular.mock.inject((_$compile_, _$rootScope_) => { ... });
```

### Qué funciona y qué no (probado)

| Escenario | `ngOnInit` | `@Input` de `@Directive` | `inject()` en field init de `@Injectable` |
|---|---|---|---|
| `bootstrapApplication(AppModule)` (en ngjs-core) | ✅ dispara | ✅ bindea | ✅ |
| `configureTestingModule({imports:[Mod]})` + `angular.mock.module` | ✅ dispara | 🔴 queda en el default | 🔴 `_RootSingletonRegistry.getFromAppInjector` tira |
| `angular.mock.module(NgbModule.name)` (el de las specs) | 🔴 no dispara | 🔴 | 🔴 |

Síntoma por feature:
- **collapse** — `ngOnInit` no corre → `_afterInit` nunca true → ninguna transición
  (ni sync con `animation=false`) → sin clases `collapse`/`show`.
- **rating** — click en estrella no actualiza el rate (host listener / `@Output`
  no cableado) + `ngOnChanges` no recomputa.
- **rating / carousel / nav** — proyección de `TemplateRef` con contexto de outlet
  falla.
- **nav** — `ng-ref` / `exportAs` read, herencia de token en queries, outlet.

### Hipótesis (a confirmar)

1. **Los decoradores de `$controller` de `ngjs-core` (lifecycle, HostBinding,
   HostListener, ElementRef, queries, output-emitter) no se aplican** en el
   injector que crea `angular.mock.module`.
   - Se instalan en `installCoreModule()` vía `.decorator("$controller", …)` sobre
     el `angular.module("ng.js.core")`.
   - Hoy `installCoreModule()` corre solo como side-effect de importar
     `src/dropdown/ngb-dropdown.module.ts` (`[installCoreModule().name]`). Cuando
     `dropdown` se migre, ese import desaparece.
   - `NgbRootModule` **no** tiene `CoreModule` en `imports` — depende de `ng.js.core`
     solo transitivamente (módulos viejos → `ng.js.common` → `ng.js.core`).
   - Sospecha: el `.decorator()` no llega a ese injector, o `coreInstalled`
     (bool a nivel módulo en ngjs-core) interactúa mal con el aislamiento por
     archivo de vitest.
2. **`@Input` de `@Directive` sin `controllerAs`**: AngularJS solo corre
   `initializeDirectiveBindings` para `bindToController` si `controller.identifier`
   está seteado (= hay `controllerAs`). `buildDirectiveDefinition` de ngjs-core deja
   `controllerAs: undefined` si ni la clase ni el `@NgModule` lo ponen. Vía
   `NgbModule` (que tiene `controllerAs: "$"`) debería propagarse a las
   declarations — **pero el probe con `configureTestingModule` sin `controllerAs`
   de módulo confirmó que sin identifier no bindea.** Falta ver si vía `NgbModule`
   sí llega el `"$"` heredado.
3. **`inject()` en field initializers** necesita el app injector activo
   (`InjectorImpl.current`), que hoy lo setea `bootstrapApplication` (el `.run`
   que fuerza `Injector`). En `angular.mock` no se arma.

### Probes hechos (2026-09-07)

- [x] `@Component` (`ngb-rating`) con `ngOnInit` vía `angular.mock.module(NgbModule.name)`:
      **el hook NO corre** (contador quedó en 0). El componente renderiza igual.
      → No es componente-vs-directiva; `ngOnInit` no dispara para nada.
- [x] `import { CoreModule }` en `NgbRootModule.imports` + `installCoreModule()`
      explícito en `ngb.module.ts`: **sin cambio** (`installCoreModule()` ya corría).
- [x] Inspección del injector tras `angular.mock.module(NgbModule.name)`:
  - `$controller` **SÍ está decorado** (el wrapper de los bridges de ngjs-core está
    en el injector). Así que los bridges se cargan.
  - La instancia del controller de `ngb-rating` **tiene `$onInit` y `ngOnInit`**
    (`typeof === "function"`), pero `$onInit` **no aparece en `Object.getOwnPropertyNames`**
    → o está en el prototipo, o la instancia que decoró el bridge no es la que
    AngularJS linkea. Y aun así `ngOnInit` no se llama.
  - `angular.module("ngb").requires` = `["ngb.alert", "ngb.progressbar",
    "ngb.collapse", …, "NgbTooltipModule", …, "NgbTypeaheadModule", "ngb-pagination",
    "ngb.datepicker"]`.

### Bug lateral: ids de módulo inconsistentes

`src/tooltip/ngb-tooltip.module.ts` y `src/typeahead/ngb-typeahead.module.ts` **no
tienen `id:`** en su `@NgModule` → se registran como `angular.module("NgbTooltipModule")`
/ `"NgbTypeaheadModule"` (nombre de clase JS). El resto usa `"ngb.x"` (o
`"ngb-pagination"`, también raro). Homogeneizar a `"ngb.tooltip"` / `"ngb.typeahead"`
al migrar esos módulos.

### Próximos pasos de diagnóstico

- [ ] ¿Por qué `$onInit` está en la instancia pero AngularJS no lo llama? Ver si
      la instancia decorada por el bridge de lifecycle == la que `nodeLinkFn`
      guarda en `controller.instance` (posible desajuste entre las capas apiladas
      de `decorateControllerWith` y el `later`-initializer de AngularJS).
- [ ] Repetir el probe de `ngOnInit` con `bootstrapApplication` en un mini-módulo
      idéntico → confirmar que ahí sí corre (ya visto en ngjs-core, reconfirmar
      en el entorno de `ngb-js`).
- [ ] Ver si `buildDirectiveDefinition` puede darle `identifier` al controller sin
      `controllerAs` (Angular real no lo exige para bindear).
- [ ] `configureTestingModule` que arme el app injector como `bootstrapApplication`
      (para que `inject()` en field initializers ande).

### Candidatos de fix

- **Harness:** un helper de test en `ngb-js` (`test/`) que envuelva
  `configureTestingModule` + arme el app injector, y migrar las specs a él
  (equivale a `TestBed.configureTestingModule` de ng-bootstrap). O que
  `ngb.module.ts` haga `installCoreModule()` + `imports: [CoreModule, …]`.
- **Core:** `@Directive` `@Input` que bindee sin `controllerAs`; `configureTestingModule`
  que deje `inject()` usable en field initializers.

Anotado también en `CORE_GAPS.md`. No tocar `ngjs-core` hasta acordar el enfoque.

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
