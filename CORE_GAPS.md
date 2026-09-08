# Faltantes de `ngjs-core` encontrados durante la migracion

Este archivo registra diferencias comprobadas al portar `ng-bootstrap` a `ngb-js`.
No se implementan adaptadores dentro de la libreria para ocultarlas: el codigo se
mantiene cercano al original y puede quedar roto hasta que el core incorpore el
contrato correspondiente.

## API pendiente

| API de Angular usada por ng-bootstrap | Estado actual en `ngjs-core` | Features afectadas |
| --- | --- | --- |
| `ViewEncapsulation` | Decision: no se va a soportar (AngularJS no tiene scoped styles ni Shadow DOM real). Sacado de los componentes afectados. | Tooltip, typeahead. |
| `ChangeDetectionStrategy.Eager` | Decision: no se va a soportar (AngularJS no tiene CD por componente). Sacado de la ventana de typeahead. | Ventana de typeahead. |
| `ControlValueAccessor` y `NG_VALUE_ACCESSOR` | No estan exportados por el core. | Rating y typeahead. |
| Providers de directiva compatibles con `NG_VALUE_ACCESSOR` | Falta el token y el flujo completo de forms. | Rating y typeahead. |
| `hostDirectives: [...]` (componer directiva sobre el host) | **Soportado** — `host-directives-bridge.ts`. Sin reenvío de `inputs`/`outputs` largos. | accordion. |
| `@Input set` de `@Directive` que tira leyendo una query estática en el link | **Resuelto** — `input-defer-bridge.ts` re-aplica el setter en `$postLink`. | accordion. |
| `@ContentChild`/`@ViewChild(forwardRef(() => X))` | **Soportado** — `resolveForwardRef` en los 4 `createDecorated*Queries`. | accordion (import circular). |
| `@ViewChild(nombre, { read: ViewContainerRef })` sobre ancla sin controller | No resuelve (falta el `$viewContainerRefController`). Ver abajo. | accordion body (adaptado: `inject(ViewContainerRef)`). |

## Diferencias soportadas

### Creacion asincrona de componentes

`ViewContainerRef.createComponent()` es asincrono en `ngjs-core`. La migracion lo
conserva como tal: `PopupService.open()`, tooltip y typeahead usan promesas nativas
y `await`. El core integra estas promesas con el ciclo de digest, por lo que no se
usan `$q`, `$timeout` ni watchers como puentes.

### `@Service()`

Resuelto en `ngjs-core`: singleton implicito de toda la app via
`RootSingletonRegistry` (factory + cache propios, ya que AngularJS no deja
registrar un `.service()` nuevo despues del bootstrap). Sin DI por constructor
(se instancia con `new Clase()`; las dependencias se piden con `inject()` en
field initializers) y sin recetas de provider (`useClass`/`useFactory`) — para
eso sigue estando `@Injectable` + `providers`.

### `SimpleChange.firstChange`, `EventEmitter<T = any>`, `InjectionToken({ providedIn, factory })`

Resueltos en `ngjs-core`: `SimpleChange` ahora expone `firstChange` como
propiedad (ademas de `isFirstChange()`, que se mantiene); `EventEmitter`
default a `any` como Angular real (antes `void`); `InjectionToken` acepta
`providedIn: 'root'` (informativo — un `factory` ya se comporta como root
singleton exista o no la opcion, via `RootSingletonRegistry`).

### `ngAfterContentChecked` / `ngAfterViewChecked` (2026-09-07, RESUELTO)

`ngjs-core` ahora reenvía los dos a `$doCheck` (una vez por digest, como
`ngDoCheck`), en el orden de Angular: `ngDoCheck` → `ngAfterContentChecked` →
`ngAfterViewChecked`, encadenados (no pisan un `$doCheck` del autor). Lo usa
`NgbAccordionBody` para insertar/quitar el `<ng-template>` del DOM en cada ciclo.

### `afterEveryRender`/`afterNextRender` con fases y `{ injector }`

Resuelto en `ngjs-core`. `AfterRenderEventManager` ahora agrupa callbacks por
fase (`earlyRead`/`write`/`mixedReadWrite`/`read`) y las corre en ESE orden a
nivel de toda la app (todos los `earlyRead` registrados antes que cualquier
`write`, etc.) — no solo dentro de un mismo llamado. Un callback plano
equivale a `{ mixedReadWrite: callback }`. `afterNextRender` con varias fases
en el mismo spec las corre todas en el mismo render antes de desenganchar. La
opcion `{ injector }` resuelve el `AfterRenderEventManager` de ESE `Injector`
en vez de depender del contexto ambiente — usa `injector.get(...)` en vez de
`inject(...)`. Esto desbloquea `PopupService.open()` (el `afterNextRender`
con `{ injector: this._injector }` fuera de un contexto de inyeccion).

### `ViewContainerRef.createComponent(..., { injector: Injector })`

Resuelto en `ngjs-core`. `create-component.ts` sigue usando el `$injector`
nativo internamente (`.has`, servicios por nombre como `"$q"`/`"$compile"` —
no vale la pena reescribirlo contra la API publica), pero
`ViewContainerRef.createComponent`/`environmentInjector` ahora aceptan
tambien nuestro `Injector` publico y lo desenvuelven al `$injector` real
justo en el borde (`InjectorImpl.nativeInjector` + `unwrapAngularInjector`).
Desbloquea el `afterNextRender`/`createComponent` de `PopupService` con
`{ injector: this._injector }`.

### `NgModule.exports`

Decision: no se va a soportar. AngularJS registra directivas/componentes de
forma plana y global por `angular.module` — no hay concepto de "declaracion
privada al modulo salvo que se exporte" (todo lo que un modulo declara ya es
visible para cualquiera que dependa de el). Agregar `exports` solo para que
compile seria fingir una semantica de visibilidad que el runtime no aplica.
Sacado de `NgbTooltipModule`/`NgbTypeaheadModule` — `imports` alcanza.

### `Component.imports` para componentes standalone

Decision: no se va a soportar. En Angular real solo controla que selectors
reconoce el template de ESE componente (visibilidad de compilacion) — DI es
un mecanismo aparte (`providers`/`inject()`), no relacionado. AngularJS no
tiene visibilidad de template por componente (todo lo registrado en un
`angular.module` alcanzable es global a esa app), asi que no hay forma de
replicar la semantica real; solo se podria reinterpretar como "declaracion
transitiva" (mismo problema que "standalone dentro de `NgModule.imports`",
arriba). Sacado de `ngb-typeahead-window.ts` — `NgbHighlight` sigue
registrado via `NgbTypeaheadModule.declarations`; `NgTemplateOutlet` queda sin
registrar en ningun lado por ahora (mismo gap de standalone-imports, abajo).

### Directivas/componentes standalone dentro de `NgModule.imports`

Decision: no se va a soportar. `imports` de `NgModuleDef` solo resuelve
modulos (otra clase `@NgModule`, un `angular.IModule`, o un nombre de
modulo) — nunca clases standalone sueltas. `NgbTooltipModule` y
`NgbTypeaheadModule` pasaron `NgbTooltip`/`NgbHighlight`/`NgbTypeahead` de
`imports` a `declarations`, que es el campo correcto para registrar
componentes/directivas en un `@NgModule`. `NgTemplateOutlet` (usado en el
template de `ngb-typeahead-window`) queda sin registrar en ningun modulo por
ahora — pendiente aparte, no de este gap.

### Objeto Angular `host: { '[prop]': '...', '(event)': '...' }`

`ngjs-core` ya tenia esto cubierto via `@HostBinding`/`@HostListener` (no via
un objeto declarativo) — no era un gap del core. Se adapto `ngb-js`, no el
core: `ngb-typeahead-window.ts`, `ngb-tooltip-window.component.ts` y
`ngb-typeahead.directive.ts` reescriben cada entrada del objeto `host` como
`@HostBinding`/`@HostListener` (getters para expresiones, atributos estaticos
como propiedades `readonly`).

### `@Directive` + `@Input` + `ngOnInit` en el harness de specs (2026-09-07)

Con `bootstrapApplication` funcionan. Con el patron de las specs de `ngb-js`
(`angular.mock.module(NgbModule.name)` + `angular.mock.inject`) fallan:

- `ngOnInit` de una `@Directive` no dispara.
- Los `@Input` de una `@Directive` no se inicializan: AngularJS solo corre
  `initializeDirectiveBindings` para `bindToController` si `controller.identifier`
  esta seteado (= hay `controllerAs`). Las `@Directive` no lo tienen; Angular real
  no lo necesita. Candidato de fix en `ngjs-core`: `buildDirectiveDefinition`
  deberia darle identidad al controller aunque no haya `controllerAs`, o el
  binding path no deberia depender de eso.
- `@Injectable` con `inject()` en field initializer no alcanza el app injector
  desde `angular.mock.inject` (`_RootSingletonRegistry.getFromAppInjector`).

Decision pendiente con el usuario: arreglar el harness (bootstrap/TestBed real de
`ngjs-core` en las specs) y/o el fix de binding de `@Directive` en el core.
Ver `MIGRATION.md`.

### Varias `@Directive` con selector que normaliza al mismo nombre (2026-09-07)

ng-bootstrap usa varias directivas para el mismo atributo, distinguidas por
elemento o `:not()`:

- `[ngbNavItem]` + `[ngbNavItem]:not(ng-container)` (`NgbNavItem` / `NgbNavItemRole`)
- `[ngbNavLink]` + `a[ngbNavLink]` + `button[ngbNavLink]` (`NgbNavLinkBase` / `NgbNavLink` / `NgbNavLinkButton`)

En AngularJS las tres normalizan al mismo nombre (`ngbNavItem` / `ngbNavLink`) y
`ngjs-core` les pone `controller` a todas → `$compile:multidir` ("Multiple
directives asking for 'X' controller"). No hay forma en AngularJS de registrar
bajo un nombre y matchear por otro.

**Adaptado en `ngb-js`** (no el core): se fusionan en una sola directiva que
ramifica por `nativeElement.tagName`. Las clases sobrantes quedan como subclases
finas para compat de import, sin registrar. Un fix en el core tendría que
detectar el solapamiento y correr la lógica de las secundarias por `link` sin
reclamar el nombre del controller.

### `TemplateRef` desde una directiva sobre `<ng-template>` (2026-09-07)

`NgbNavContent` = `@Directive({ selector: "ng-template[ngbNavContent]" })`. En
ng-bootstrap hace `templateRef = inject(TemplateRef)` y `NgbNavItem` lo lee con
`@ContentChild(NgbNavContent, { read: TemplateRef })`. En `ngjs-core` ninguna de
las dos resuelve: el directive `ngTemplate` (que crea el `TemplateRef`) tiene
`transclude: 'element'`, así que su controller queda sobre el nodo-comentario, no
sobre el `<ng-template>` donde está la directiva marcadora → distinta identidad
de nodo. `inject(...)` corre en el field initializer (antes del link) y
`@ContentChild({read})` busca un candidato co-ubicado que no coincide de nodo.

Lo único que funciona hoy es `require: 'ngTemplate'` (AngularJS resuelve
controllers del mismo elemento original pese al transclude) — es lo que usa
`decorateNgRefDirective`.

**Adaptado en `ngb-js`:** `NgbNavContent` queda como marcador vacío; falta que
`@ContentChild(NgbNavContent, { read: TemplateRef })` en `NgbNavItem` devuelva el
`TemplateRef`. **Bloquea nav** (el outlet no renderiza el contenido del tab).
Fix en el core: rutear la resolución de `TemplateRef` para directivas sobre
`<ng-template>` por `require: 'ngTemplate'` y registrar ese `TemplateRef` como
candidato de query en el nodo del `<ng-template>`.

### `@Input` valor literal de atributo → `@Input({ binding: "@" })` (2026-09-07, RESUELTO)

Angular: `<btn placement="top left">` pasa el string `"top left"` al `@Input()`;
`<btn [placement]="expr">` evalúa `expr`. `ngjs-core` traducía `@Input()` SIEMPRE
a un binding `<?` (one-way de expresión), así que `placement="top left"` se
evaluaba como expresión y `$parse` tiraba con espacios/puntuación.

**Resuelto en el core** con una opción explícita (sin heurística de comillas ni
de "parece expresión"): `@Input({ binding: "@" })` registra `@?` de AngularJS —
string literal / interpolación (`attr="texto"`, `attr="{{ x }}"`), igual que
`@Input()` de Angular usado como `attr="valor"`. `@Input()` a secas sigue `<?`.

Residual (por diseño, no es gap): un input de tipo dual `string | TemplateRef`
(`ngbTooltip`, `ngbPopover`, `positionTarget`) se deja en `<` y el string se
pasa entrecomillado — necesita las dos formas y `@` solo daría el string.
`ngb-js`: tooltip marca `placement`/`triggers`/`container`/`tooltipClass` como
`binding: "@"`.

### `hostDirectives` → soportado (2026-09-07, RESUELTO)

ng-bootstrap v20 `accordion` usa `hostDirectives` en dos lados:

- `NgbAccordionCollapse` → `hostDirectives: [NgbCollapse]` + `ngbCollapse = inject(NgbCollapse)`.
- `NgbAccordionButton` → `hostDirectives: [NgbAccordionToggle]` (el `<button>`
  hereda el click-handler y los ARIA del toggle sin escribirlos en el markup).

**Resuelto en el core**: `runtime/bridges/host-directives-bridge.ts` — decorador
de `$controller` (el más externo). Antes de construir el host, por cada entrada
de `def.hostDirectives`:

1. instancia esa directiva sobre el mismo `$element` pasando por TODA la cadena de
   bridges (`inject()`, `@HostBinding`, `@HostListener`, `lifecycle`, queries);
2. la publica en `$element.data("$<sel>Controller")` → `inject()` la encuentra
   (mismo camino que el fallback estilo `require`);
3. le corre `$onInit` / `$postLink` (diferido) / `$onDestroy` a mano (AngularJS no
   conoce la instancia). `@HostBinding`/`@HostListener` ya quedaron cableados en el
   paso 1 (esos bridges trabajan en `onInstance`).

Limitaciones: no reenvía `inputs`/`outputs` de la forma larga
`{ directive, inputs, outputs }`; no soporta `hostDirectives` en `@Component` de
elemento (sí de atributo y `@Directive`).

### `@Input` de `@Directive` cuyo setter tira en el link temprano → replay (2026-09-07, RESUELTO)

Angular aplica los `@Input` de una directiva durante la **detección de cambios**
del host — después de crear la vista/el contenido y resolver las queries
`{ static: true }`. `ngjs-core` (AngularJS) los asigna **sincrónicamente en el
link**, ANTES de linkear los hijos → un `@Input set` que lee un `@ContentChild`/
`@ViewChild` estático lo ve `undefined` y tira.

Rompía `NgbAccordionItem`: `@Input() set collapsed` llama `expand()`, que toca
`this._collapse.ngbCollapse` (`@ContentChild(NgbAccordionCollapse, { static: true })`).
Con `[collapsed]="false"` inicial → `TypeError` en el link.

**Resuelto en el core**: `runtime/bridges/input-defer-bridge.ts` parcha los
SETTERS de `@Input` de cada `@Directive`. Si el setter tira durante ese link
temprano, el valor se guarda y se re-aplica en `$postLink` — ya con las queries
resueltas (el bridge es interno a `ng-ref-bridge`, así su `resolve()` corre
antes). Un setter que NO tira corre igual que siempre, sin cambio de timing.

### `@ContentChild`/`@ViewChild(forwardRef(() => X))` (2026-09-07, RESUELTO)

Con directivas en archivos separados y `inject()` cruzado hay imports circulares:
`A` decora con `@ContentChildren(X)` mientras `X` (definido en `B`, que importa
`A`) todavía es `undefined` según el orden de carga.

**Resuelto en el core**: los 4 `createDecorated*Queries` desenvuelven el locator
(y `read`) con `resolveForwardRef` al CONSTRUIR la query (una vez por instancia)
— para entonces `X` ya existe. `accordion` usa
`@ContentChildren(forwardRef(() => NgbAccordionItem), { descendants: false })`.

### `@ViewChild(nombre, { read: ViewContainerRef })` sobre un ancla que no es componente (2026-09-07)

`ngjs-core` publica el `$viewContainerRefController` solo en elementos que TIENEN
un controller (lo pone `view-container-ref-bridge` en `augmentLocals`). Un
`<ng-container #container />` / `<span #container>` pelado no lo tiene, así que
`@ViewChild("container", { read: ViewContainerRef })` queda `undefined`.

ng-bootstrap v20 `NgbAccordionBody` usa ese patrón. **Adaptado en `ngb-js`**: el
body usa el `ViewContainerRef` de su propio host (`inject(ViewContainerRef)`) y el
template pasa a `<ng-content />` a secas — mismo efecto (la vista embebida queda
dentro del `.accordion-body`). Fix en el core: que `@ViewChild(read: ViewContainerRef)`
sintetice un VCR desde el nodo del candidato (como ya hace con `ElementRef`).

**Estado accordion:** ✅ **2/2** — migrado 1:1 a v20 (7 clases, un archivo por
directiva, `@Directive`/`@Component`, `inject()`, `@HostBinding`/`@HostListener`,
`@ContentChild(ren)`, `hostDirectives`, ciclo de vida Angular). Únicas
adaptaciones: `forwardRef` en el `@ContentChildren` (import circular) y el
`ViewContainerRef` del body por `inject` (arriba).

### `@HostListener` con pseudo-eventos de tecla → soportado (2026-09-07, RESUELTO)

ng-bootstrap usa `host: { '(keydown.ArrowUp)': '...', '(keydown.Shift.Tab)': '...' }`
(dropdown menu/toggle, nav, …). `ngjs-core` no tiene la sintaxis de objeto `host`
(se adapta a `@HostListener`), y `@HostListener` traducía el nombre tal cual a
`addEventListener("keydown.arrowup")` → nunca dispara.

**Resuelto en el core**: `@HostListener("keydown.arrowdown")` /
`@HostListener("keydown.shift.tab")` ahora se parsean con el mismo álgebra que el
`KeyEventsPlugin` de Angular — `<evento>.<modificador...>.<tecla>`, modificadores
(`alt`/`control`/`meta`/`shift`) en cualquier orden, `tecla` contra
`KeyboardEvent.key` en minúsculas (`" "`→`space`, `"."`→`dot`). Ver
`core/metadata/host-listener-key.ts` + `runtime/bridges/host-listener-bridge.ts`.
Se pueden apilar varios `@HostListener` sobre el mismo método.

### Token `DOCUMENT` no es `providedIn: 'root'`

`inject(DOCUMENT)` (patrón de `NgbNav`, `NgbTooltip`, `NgbTypeahead`, `ScrollSpy`,
`Live`) tira `RootSingletonRegistry: no hay factory` salvo que el grafo importe
`PlatformBrowserModule` de `ngjs-core/platform-browser`. Se agregó a
`NgbRootModule.imports`. En Angular real `DOCUMENT` siempre está.

## Reglas del port

- No modificar `ngjs-core` desde `ngb-js`.
- No agregar bindings manuales, wrappers o servicios de compatibilidad para cubrir
  APIs ausentes.
- Mantener templates sin cambios.
- Registrar aqui cada nuevo faltante confirmado antes de continuar con otro feature.

