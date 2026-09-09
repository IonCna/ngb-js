# Estado de migración a `ngjs-core` — inventario por archivo

Generado: 2026-09-08. Rama `master` (HEAD `f6758ee`).

## Resumen

| | |
|---|---|
| Archivos fuente `.ts` (sin specs) | 163 |
| Migrados a `ngjs-core` (`@NgModule` / `@Component` / `@Directive` / `@Service` / `@Pipe` + `inject()`) | **todos los componibles** |
| Estilo AngularJS crudo restante (`$factory` / `bindToController` / `IComponentController`) | **0** |
| Shims viejos que todavía funcionan pero no se migraron del todo | **4** (ver abajo) |
| Tests: `vitest run` completo | **477 / 480 pasan** (2 fallos preexistentes en `config-services`, 1 por contaminación entre specs en datepicker) |

### Lo único que falta de verdad

| Archivo | Problema | Impacto |
|---|---|---|
| `src/ngb-config.service.ts` | `NgbConfig` sigue con `static get $name`, sin `@Service()` | Funciona (se registra por `providers`), pero es el patrón viejo. |
| `src/utils/rtl.service.ts` | `NgbRTL` viejo (`static get $inject` / `$name`). Ya existe `src/utils/rtl.ts` con `@Service()`. **Los dos coexisten**: los módulos cablean el viejo, `positioning.ts` usa el nuevo. | Duplicado. Hay que borrar `rtl.service.ts` y apuntar todo a `utils/rtl.ts`. |
| `src/ngb-scrollbar.service.ts` | `NgbScrollbar` viejo (constructor `$window`, sin decorador). Ya existe `src/utils/scrollbar.ts` con `@Service() ScrollBar`. **Los dos coexisten**: `ngb.module`, `modal-stack` y `offcanvas-stack` cablean el viejo. | Duplicado. Hay que borrar `ngb-scrollbar.service.ts` y apuntar todo a `utils/scrollbar.ts`. |
| `src/ngb.module.ts` | `@NgModule` OK, pero se exporta como `class NgbModule {}` cruda (sin `registerNgModule`). Por eso `NgbModule.name` da `"NgbModule"` y no `"ngb"`, y rompía todo spec que hacía `angular.mock.module(NgbModule.name)`. | **Ya mitigado**: esos specs ahora usan `angular.mock.module(getNgModuleName(NgbModule))`. Si `NgbModule` se queda como clase, esto es lo correcto; si vuelve a `registerNgModule(...)`, revertir esos 7 specs. |

### Fallos de test vigentes (no bloqueantes, preexistentes)

| Spec | Fallos | Causa |
|---|---|---|
| `src/config-services.spec.ts` | `provides modal and offcanvas defaults`, `lets local animation overrides take precedence over NgbConfig` | Preexistentes desde `303a475`. Defaults de modal/offcanvas y propagación de `NgbConfig.animation`. |
| `src/datepicker/ngb-datepicker.module.spec.ts` | 1 test (variable) | Contaminación entre archivos de spec (AngularJS se carga más de una vez en el mismo worker). Aislado pasa 29/29. |

### Leyenda

- **✅ Migrado** — decoradores `ngjs-core` + `inject()`.
- **➖ N/A** — datos, tipos, funciones puras, barrels (`index.ts`), CSS. No hay estilo de framework que migrar.
- **⚠️ Shim** — funciona con el core nuevo pero conserva estilo AngularJS, o hay un duplicado viejo todavía cableado.
- **HTML** — plantilla; migra junto con su componente (todas las de abajo están migradas).

---

## core / raíz

| Archivo | Qué es | Estado |
|---|---|---|
| `src/index.ts` | Barrel público de la librería | ➖ |
| `src/ngb.module.ts` | `@NgModule` raíz `NgbModule` | ⚠️ export `class` cruda (ver arriba) |
| `src/ngb-config.service.ts` | `NgbConfig` — flag global `animation` | ⚠️ shim `$name` |
| `src/ngb-scrollbar.service.ts` | `NgbScrollbar` — oculta la scrollbar del body | ⚠️ shim + duplicado de `utils/scrollbar.ts` |
| `src/config-services.spec.ts` | Defaults de todos los `*Config` | ✅ patrón `getNgModuleName` — 2 fallos preexistentes |

## utils

| Archivo | Qué es | Estado |
|---|---|---|
| `src/utils/index.ts` | Barrel | ➖ |
| `src/utils/util.ts` | Helpers (`isString`, `toInteger`, `padNumber`…) | ✅ |
| `src/utils/triggers.ts` | `listenToTriggers` | ➖ función pura |
| `src/utils/autoclose.ts` | `ngbAutoClose` | ✅ |
| `src/utils/focus-trap.ts` | Trampa de foco | ✅ |
| `src/utils/popup.service.ts` | `PopupService` (crea componentes de popup) | ✅ |
| `src/utils/positioning.ts` | `ngbPositioning` (popper) | ✅ (`inject(NgbRTL)` → `utils/rtl.ts`) |
| `src/utils/positioning.util.ts` | `addPopperOffset` | ➖ función pura |
| `src/utils/rtl.ts` | `NgbRTL` **`@Service()`** — dirección RTL | ✅ **nuevo** |
| `src/utils/rtl.service.ts` | `NgbRTL` **viejo** (`$inject`/`$name`) | ⚠️ duplicado; lo cablean `ngb.module` y `datepicker.module` |
| `src/utils/scrollbar.ts` | `ScrollBar` **`@Service()`** | ✅ **nuevo** |
| `src/utils/rtl.ts` / `scrollbar.ts` | (nuevas versiones canónicas) | ✅ |
| `src/utils/accessibility/live.ts` | `Live` — anuncios `aria-live` | ✅ `@Service` |
| `src/utils/transition/ngb-transition.ts` | `ngbRunTransition`, `ngbCompleteTransition` | ✅ |
| `src/utils/transition/ngb-collapse-transition.ts` | Transición de collapse | ➖ función pura |
| `src/utils/transition/util.ts` | Helpers de duración de transición | ➖ función pura |
| `src/utils/transition/index.ts` | Barrel | ➖ |
| `src/utils/positioning.spec.ts` | | ✅ unit puro |
| `src/utils/transition/ngb-transition.spec.ts` | | ✅ unit puro |
| `src/utils/transition/util.spec.ts` | | ✅ unit puro |
| `src/utils/triggers.spec.ts` | | ✅ unit puro |
| `src/utils/util.spec.ts` | | ✅ unit puro |
| `src/utils/accessibility/live.spec.ts` | | ✅ `getNgModuleName` |

## accordion

| Archivo | Qué es | Estado |
|---|---|---|
| `src/accordion/ngb-accordion.module.ts` | Módulo | ✅ `@NgModule` |
| `src/accordion/ngb-accordion.directive.ts` | `[ngbAccordion]` (raíz) | ✅ `@Directive` |
| `src/accordion/ngb-accordion-item.directive.ts` | `ngb-accordion-item` | ✅ `@Directive` |
| `src/accordion/ngb-accordion-header.directive.ts` | `[ngbAccordionHeader]` | ✅ `@Directive` |
| `src/accordion/ngb-accordion-button.directive.ts` | `[ngbAccordionButton]` | ✅ `@Directive` |
| `src/accordion/ngb-accordion-toggle.directive.ts` | `[ngbAccordionToggle]` | ✅ `@Directive` |
| `src/accordion/ngb-accordion-collapse.directive.ts` | `[ngbAccordionCollapse]` | ✅ `@Directive` |
| `src/accordion/ngb-accordion-body.directive.ts` | `[ngbAccordionBody]` | ✅ `@Component` |
| `src/accordion/ngb-accordion-config.service.ts` | `NgbAccordionConfig` | ✅ `@Service` |
| `src/accordion/index.ts` | Barrel | ➖ |
| `src/accordion/ngb-accordion.directive.spec.ts` | | ✅ `configureTestBed` |

## alert

| Archivo | Qué es | Estado |
|---|---|---|
| `src/alert/ngb-alert.module.ts` | Módulo | ✅ `@NgModule` |
| `src/alert/ngb-alert.component.ts` | `ngb-alert` | ✅ `@Component` |
| `src/alert/ngb-alert.component.html` | Plantilla | ✅ |
| `src/alert/ngb-alert-config.service.ts` | `NgbAlertConfig` | ✅ `@Service` |
| `src/alert/ngb-alert-transition.ts` | Transición fade | ➖ función pura |
| `src/alert/index.ts` | Barrel | ➖ |
| `src/alert/ngb-alert.component.spec.ts` | | ✅ `configureTestBed` |

## carousel

| Archivo | Qué es | Estado |
|---|---|---|
| `src/carousel/ngb-carousel.module.ts` | Módulo | ✅ `@NgModule` |
| `src/carousel/ngb-carousel.component.ts` | `ngb-carousel` | ✅ `@Component` |
| `src/carousel/ngb-carousel.component.html` | Plantilla | ✅ |
| `src/carousel/ngb-slide.directive.ts` | `ng-template[ngbSlide]` | ✅ `@Directive` |
| `src/carousel/ngb-carousel-config.service.ts` | `NgbCarouselConfig` | ✅ `@Service` |
| `src/carousel/ngb-carousel-transition.ts` | Transición de slides | ➖ función pura |
| `src/carousel/index.ts` | Barrel | ➖ |
| `src/carousel/ngb-carousel.component.spec.ts` | | ✅ `configureTestBed` |

## collapse

| Archivo | Qué es | Estado |
|---|---|---|
| `src/collapse/ngb-collapse.module.ts` | Módulo | ✅ `@NgModule` |
| `src/collapse/ngb-collapse.directive.ts` | `[ngbCollapse]` | ✅ `@Directive` |
| `src/collapse/ngb-collapse-config.service.ts` | `NgbCollapseConfig` | ✅ `@Service` |
| `src/collapse/index.ts` | Barrel | ➖ |
| `src/collapse/ngb-collapse.directive.spec.ts` | | ✅ `configureTestBed` |

## datepicker

| Archivo | Qué es | Estado |
|---|---|---|
| `src/datepicker/ngb-datepicker.module.ts` | Módulo | ✅ `@NgModule` |
| `src/datepicker/ngb-datepicker.component.ts` | `ngb-datepicker` | ✅ `@Component` |
| `src/datepicker/ngb-datepicker.component.html` | Plantilla | ✅ |
| `src/datepicker/ngb-datepicker-content.component.ts` | Contenido / `ng-template` | ✅ `@Directive` |
| `src/datepicker/ngb-datepicker-month.component.ts` | `ngb-datepicker-month` | ✅ `@Component` |
| `src/datepicker/ngb-datepicker-month.component.html` | Plantilla | ✅ |
| `src/datepicker/ngb-datepicker-day-view.component.ts` | `[ngbDatepickerDayView]` | ✅ `@Component` |
| `src/datepicker/ngb-datepicker-navigation.component.ts` | `ngb-datepicker-navigation` | ✅ `@Component` |
| `src/datepicker/ngb-datepicker-navigation.component.html` | Plantilla | ✅ |
| `src/datepicker/ngb-datepicker-navigation-select.component.ts` | `ngb-datepicker-navigation-select` | ✅ `@Component` |
| `src/datepicker/ngb-datepicker-navigation-select.component.html` | Plantilla | ✅ |
| `src/datepicker/ngb-input-datepicker.directive.ts` | `[ngbDatepicker]` (input) | ✅ `@Directive` + `inject()` |
| `src/datepicker/ngb-datepicker.service.ts` | `NgbDatepickerService` | ✅ `@Service` |
| `src/datepicker/ngb-calendar.service.ts` | `NgbCalendar` (gregoriano) | ✅ `@Service` |
| `src/datepicker/ngb-datepicker-i18n.service.ts` | `NgbDatepickerI18n` | ✅ `@Service` |
| `src/datepicker/ngb-datepicker-keyboard.service.ts` | `NgbDatepickerKeyboardService` | ✅ `@Service` |
| `src/datepicker/ngb-date-parser-formatter.ts` | `NgbDateParserFormatter` | ✅ `@Service` |
| `src/datepicker/ngb-datepicker-config.service.ts` | `NgbDatepickerConfig` | ✅ `@Service` |
| `src/datepicker/ngb-input-datepicker-config.service.ts` | `NgbInputDatepickerConfig` | ✅ `@Service` |
| `src/datepicker/adapters/ngb-date-adapter.ts` | `NgbDateAdapter` (abstracta) | ✅ `@Service` |
| `src/datepicker/adapters/ngb-date-native-adapter.ts` | Adapter `Date` | ➖ subclase de datos |
| `src/datepicker/adapters/ngb-date-native-utc-adapter.ts` | Adapter `Date` UTC | ➖ subclase de datos |
| `src/datepicker/ngb-date.ts` | `NgbDate` (VO) | ➖ dato |
| `src/datepicker/ngb-date-struct.ts` | `NgbDateStruct` (interface) | ➖ tipo |
| `src/datepicker/ngb-datepicker-tools.ts` | Helpers de fecha | ➖ funciones puras |
| `src/datepicker/ngb-datepicker-view-model.ts` | Tipos del view-model | ➖ tipos |
| `src/datepicker/ngb-datepicker-day-template-context.ts` | Tipo de contexto | ➖ tipo |
| `src/datepicker/ngb-datepicker-content-template-context.ts` | Tipo de contexto | ➖ tipo |
| `src/datepicker/buddhist/*.ts` | Calendario budista (`ngb-calendar-buddhist`, `buddhist`) | ➖ math/calendario |
| `src/datepicker/ethiopian/*.ts` | Calendario etíope + i18n amárico | ➖ math/i18n |
| `src/datepicker/hebrew/*.ts` | Calendario hebreo + i18n | ➖ math/i18n |
| `src/datepicker/hijri/*.ts` | Calendarios islámicos (civil, umalqura, base) | ➖ math |
| `src/datepicker/jalali/*.ts` | Calendario persa | ➖ math |
| `src/datepicker/standard-galactic-alphabet/*.ts` | Calendario "commander keen" | ➖ math |
| `src/datepicker/datepicker*.css` (5) | Estilos | ➖ |
| `src/datepicker/index.ts` | Barrel | ➖ |
| `src/datepicker/ngb-datepicker-core.spec.ts` | | ✅ `configureTestBed` |
| `src/datepicker/ngb-datepicker-day-view.spec.ts` | | ✅ `configureTestBed` |
| `src/datepicker/ngb-datepicker-navigation.spec.ts` | | ✅ `configureTestBed` |
| `src/datepicker/ngb-datepicker.module.spec.ts` | | ✅ `configureTestBed` — 1 fallo por contaminación entre specs |
| `src/datepicker/ngb-datepicker-calendars.spec.ts` | | ✅ unit puro |
| `src/datepicker/ngb-datepicker-keyboard.spec.ts` | | ✅ unit puro |
| `src/datepicker/ngb-datepicker-model.spec.ts` | | ✅ unit puro |

## dropdown

| Archivo | Qué es | Estado |
|---|---|---|
| `src/dropdown/ngb-dropdown.module.ts` | Módulo | ✅ `@NgModule` |
| `src/dropdown/ngb-dropdown.directive.ts` | `[ngbDropdown]` | ✅ `@Directive` |
| `src/dropdown/ngb-dropdown-menu.directive.ts` | `[ngbDropdownMenu]` | ✅ `@Directive` |
| `src/dropdown/ngb-dropdown-toggle.directive.ts` | `[ngbDropdownToggle]` | ✅ `@Directive` |
| `src/dropdown/ngb-dropdown-anchor.directive.ts` | `[ngbDropdownAnchor]` | ✅ `@Directive` |
| `src/dropdown/ngb-dropdown-item.directive.ts` | `[ngbDropdownItem]` | ✅ `@Directive` |
| `src/dropdown/ngb-dropdown-button-item.directive.ts` | `button[ngbDropdownItem]` | ✅ alias de compat (subclase, no se registra) |
| `src/dropdown/ngb-dropdown-config.service.ts` | `NgbDropdownConfig` | ✅ `@Service` |
| `src/dropdown/index.ts` | Barrel | ➖ |
| `src/dropdown/ngb-dropdown.directive.spec.ts` | | ✅ `configureTestBed` |

## modal

| Archivo | Qué es | Estado |
|---|---|---|
| `src/modal/ngb-modal.module.ts` | Módulo | ✅ `@NgModule` |
| `src/modal/ngb-modal.service.ts` | `NgbModal` | ✅ `@Service` |
| `src/modal/ngb-modal-stack.service.ts` | `NgbModalStack` | ✅ `@Service` (cablea `NgbScrollbar` viejo) |
| `src/modal/ngb-modal-window.component.ts` | `ngb-modal-window` | ✅ `@Component` |
| `src/modal/ngb-modal-window.component.html` | Plantilla | ✅ |
| `src/modal/ngb-modal-backdrop.component.ts` | `ngb-modal-backdrop` | ✅ `@Component` |
| `src/modal/ngb-modal-config.service.ts` | `NgbModalConfig` | ✅ `@Service` |
| `src/modal/ngb-modal-ref.ts` | `NgbModalRef` / `NgbActiveModal` | ✅ (clases de ref, `ComponentRef` de ngjs-core) |
| `src/modal/ngb-modal-dismiss-reasons.ts` | Enum de razones | ➖ dato |
| `src/modal/index.ts` | Barrel | ➖ |
| `src/modal/ngb-modal.service.spec.ts` | | ✅ `configureTestBed` |

## nav

| Archivo | Qué es | Estado |
|---|---|---|
| `src/nav/ngb-nav.module.ts` | Módulo | ✅ `@NgModule` |
| `src/nav/ngb-nav.directive.ts` | `[ngbNav]` | ✅ `@Directive` |
| `src/nav/ngb-nav-item.directive.ts` | `[ngbNavItem]` | ✅ `@Directive` |
| `src/nav/ngb-nav-item-role.directive.ts` | rol ARIA del item | ✅ `@Directive` |
| `src/nav/ngb-nav-link-base.directive.ts` | Lógica de `[ngbNavLink]` (ramifica por `tagName`) | ✅ `@Directive` |
| `src/nav/ngb-nav-link.directive.ts` | `a[ngbNavLink]` | ✅ alias de compat (subclase, no se registra) |
| `src/nav/ngb-nav-link-button.directive.ts` | `button[ngbNavLink]` | ✅ alias de compat (subclase, no se registra) |
| `src/nav/ngb-nav-content.directive.ts` | `ng-template[ngbNavContent]` | ✅ `@Directive` |
| `src/nav/ngb-nav-outlet.directive.ts` | `[ngbNavOutlet]` | ✅ `@Component` |
| `src/nav/ngb-nav-pane.directive.ts` | panel renderizado | ✅ `@Directive` |
| `src/nav/ngb-nav-config.service.ts` | `NgbNavConfig` | ✅ `@Service` |
| `src/nav/ngb-nav-transition.ts` | Transición de paneles | ➖ función pura |
| `src/nav/index.ts` | Barrel | ➖ |
| `src/nav/ngb-nav.directive.spec.ts` | | ✅ `getNgModuleName` |

## offcanvas

| Archivo | Qué es | Estado |
|---|---|---|
| `src/offcanvas/ngb-offcanvas.module.ts` | Módulo | ✅ `@NgModule` |
| `src/offcanvas/ngb-offcanvas.service.ts` | `NgbOffcanvas` | ✅ `@Service` |
| `src/offcanvas/ngb-offcanvas-stack.service.ts` | `NgbOffcanvasStack` | ✅ `@Service` (cablea `NgbScrollbar` viejo) |
| `src/offcanvas/ngb-offcanvas-panel.component.ts` | `ngb-offcanvas-panel` | ✅ `@Component` |
| `src/offcanvas/ngb-offcanvas-backdrop.component.ts` | `ngb-offcanvas-backdrop` | ✅ `@Component` |
| `src/offcanvas/ngb-offcanvas-config.service.ts` | `NgbOffcanvasConfig` | ✅ `@Service` |
| `src/offcanvas/ngb-offcanvas-ref.ts` | `NgbOffcanvasRef` / `NgbActiveOffcanvas` | ✅ (clases de ref) |
| `src/offcanvas/ngb-offcanvas-dismiss-reasons.ts` | Enum | ➖ dato |
| `src/offcanvas/ngb-offcanvas-transition.ts` | Transición | ➖ función pura |
| `src/offcanvas/ngb-offcanvas-panel-transition.ts` | Transición del panel | ➖ función pura |
| `src/offcanvas/index.ts` | Barrel | ➖ |
| `src/offcanvas/ngb-offcanvas.service.spec.ts` | | ✅ `configureTestBed` |

## pagination

| Archivo | Qué es | Estado |
|---|---|---|
| `src/pagination/ngb-pagination.module.ts` | Módulo | ✅ `@NgModule` |
| `src/pagination/ngb-pagination.component.ts` | `ngb-pagination` | ✅ `@Component` |
| `src/pagination/ngb-pagination.component.html` | Plantilla | ✅ |
| `src/pagination/ngb-pagination-pages.directive.ts` | `[ngbPaginationPages]` | ✅ `@Directive` |
| `src/pagination/ngb-pagination-ellipsis.directive.ts` | template `ellipsis` | ✅ `@Directive` |
| `src/pagination/ngb-pagination-first.directive.ts` | template `first` | ✅ `@Directive` |
| `src/pagination/ngb-pagination-last.directive.ts` | template `last` | ✅ `@Directive` |
| `src/pagination/ngb-pagination-next.directive.ts` | template `next` | ✅ `@Directive` |
| `src/pagination/ngb-pagination-previous.directive.ts` | template `previous` | ✅ `@Directive` |
| `src/pagination/ngb-pagination-number.directive.ts` | template `number` | ✅ `@Directive` |
| `src/pagination/ngb-pagination-config.service.ts` | `NgbPaginationConfig` | ✅ `@Service` |
| `src/pagination/index.ts` | Barrel | ➖ |
| `src/pagination/ngb-pagination.component.spec.ts` | | ✅ `getNgModuleName` |

## popover

| Archivo | Qué es | Estado |
|---|---|---|
| `src/popover/ngb-popover.module.ts` | Módulo | ✅ `@NgModule` |
| `src/popover/ngb-popover.directive.ts` | `[ngbPopover]` | ✅ `@Directive` (migrado en `f6758ee`) |
| `src/popover/ngb-popover-window.component.ts` | `ngb-popover-window` | ✅ `@Component` (nuevo, reemplaza `ngb-popover-window.ts`) |
| `src/popover/ngb-popover-window.component.html` | Plantilla | ✅ |
| `src/popover/ngb-popover-config.service.ts` | `NgbPopoverConfig` | ✅ `@Service` |
| `src/popover/index.ts` | Barrel | ➖ |
| `src/popover/ngb-popover.directive.spec.ts` | | ✅ `configureTestBed` |

## progressbar

| Archivo | Qué es | Estado |
|---|---|---|
| `src/progressbar/ngb-progressbar.module.ts` | Módulo | ✅ `@NgModule` |
| `src/progressbar/ngb-progressbar.component.ts` | `ngb-progressbar` | ✅ `@Component` |
| `src/progressbar/ngb-progressbar.component.html` | Plantilla | ✅ |
| `src/progressbar/ngb-progressbar-stacked.component.ts` | `ngb-progressbar-stacked` | ✅ `@Component` |
| `src/progressbar/ngb-progressbar-percent.filter.ts` | filtro `%` | ✅ `@Pipe` |
| `src/progressbar/ngb-progressbar-config.service.ts` | `NgbProgressbarConfig` | ✅ `@Service` |
| `src/progressbar/index.ts` | Barrel | ➖ |
| `src/progressbar/ngb-progressbar.component.spec.ts` | | ✅ `getNgModuleName` |

## rating

| Archivo | Qué es | Estado |
|---|---|---|
| `src/rating/ngb-rating.module.ts` | Módulo | ✅ `@NgModule` |
| `src/rating/ngb-rating.component.ts` | `ngb-rating` | ✅ `@Component` |
| `src/rating/ngb-rating.component.html` | Plantilla | ✅ |
| `src/rating/ngb-rating-config.service.ts` | `NgbRatingConfig` | ✅ `@Service` |
| `src/rating/index.ts` | Barrel | ➖ |
| `src/rating/ngb-rating.component.spec.ts` | | ✅ `getNgModuleName` |

## scrollspy

| Archivo | Qué es | Estado |
|---|---|---|
| `src/scrollspy/ngb-scrollspy.module.ts` | Módulo | ✅ `@NgModule` |
| `src/scrollspy/ngb-scrollspy.directive.ts` | `[ngbScrollSpy]` | ✅ `@Directive` |
| `src/scrollspy/ngb-scrollspy-fragment.directive.ts` | `[ngbScrollSpyFragment]` | ✅ `@Directive` |
| `src/scrollspy/ngb-scrollspy-item.directive.ts` | `[ngbScrollSpyItem]` | ✅ `@Directive` |
| `src/scrollspy/ngb-scrollspy-menu.directive.ts` | `[ngbScrollSpyMenu]` | ✅ `@Directive` (limpiado en esta tanda) |
| `src/scrollspy/scrollspy.service.ts` | `NgbScrollSpyService` | ✅ `@Service` |
| `src/scrollspy/ngb-scrollspy-config.service.ts` | `NgbScrollSpyConfig` | ✅ `@Service` |
| `src/scrollspy/scrollspy.utils.ts` | Helpers (`defaultProcessChanges`) | ➖ funciones puras |
| `src/scrollspy/index.ts` | Barrel | ➖ |
| `src/scrollspy/ngb-scrollspy.directive.spec.ts` | | ✅ `configureTestBed` |
| `src/scrollspy/scrollspy.service.spec.ts` | | ✅ `configureTestBed` |
| `src/scrollspy/scrollspy.utils.spec.ts` | | ✅ unit puro |

## timepicker

| Archivo | Qué es | Estado |
|---|---|---|
| `src/timepicker/ngb-timepicker.module.ts` | Módulo | ✅ `@NgModule` |
| `src/timepicker/ngb-timepicker.component.ts` | `ngb-timepicker` | ✅ `@Component` (`ControlValueAccessor`) |
| `src/timepicker/ngb-timepicker.component.html` | Plantilla | ✅ |
| `src/timepicker/ngb-timepicker-config.service.ts` | `NgbTimepickerConfig` | ✅ `@Service` |
| `src/timepicker/ngb-timepicker-i18n.ts` | `NgbTimepickerI18n` | ✅ `@Service` |
| `src/timepicker/ngb-timepicker-adapter.service.ts` | `NgbTimeAdapter` | ✅ `@Service` |
| `src/timepicker/ngb-time.ts` | `NgbTime` (VO) | ➖ dato |
| `src/timepicker/ngb-timepicker-struct.ts` | `NgbTimeStruct` (interface) | ➖ tipo |
| `src/timepicker/index.ts` | Barrel | ➖ |
| `src/timepicker/ngb-timepicker.component.spec.ts` | | ✅ `configureTestBed` |
| `src/timepicker/ngb-timepicker-i18n.spec.ts` | | ✅ `configureTestBed` |
| `src/timepicker/ngb-timepicker-custom-adapter.spec.ts` | | ✅ `configureTestBed` |
| `src/timepicker/ngb-time.spec.ts` | | ✅ unit puro |
| `src/timepicker/ngb-timepicker-adapter.service.spec.ts` | | ✅ unit puro |
| `src/timepicker/ngb-timepicker-config.service.spec.ts` | | ✅ unit puro |

## toast

| Archivo | Qué es | Estado |
|---|---|---|
| `src/toast/ngb-toast.module.ts` | Módulo | ✅ `@NgModule` |
| `src/toast/ngb-toast.component.ts` | `ngb-toast` | ✅ `@Component` |
| `src/toast/ngb-toast.component.html` | Plantilla | ✅ |
| `src/toast/ngb-toast-header.directive.ts` | `[ngbToastHeader]` | ✅ `@Directive` |
| `src/toast/ngb-toast-config.service.ts` | `NgbToastConfig` | ✅ `@Service` |
| `src/toast/ngb-toast-transition.ts` | Transición fade | ➖ función pura |
| `src/toast/index.ts` | Barrel | ➖ |
| `src/toast/ngb-toast.component.spec.ts` | | ✅ `configureTestBed` |

## tooltip

| Archivo | Qué es | Estado |
|---|---|---|
| `src/tooltip/ngb-tooltip.module.ts` | Módulo | ✅ `@NgModule` |
| `src/tooltip/ngb-tooltip.directive.ts` | `[ngbTooltip]` | ✅ `@Directive` |
| `src/tooltip/ngb-tooltip-window.component.ts` | `ngb-tooltip-window` | ✅ `@Component` |
| `src/tooltip/ngb-tooltip-window.component.html` | Plantilla | ✅ |
| `src/tooltip/ngb-tooltip-config.service.ts` | `NgbTooltipConfig` | ✅ `@Service` |
| `src/tooltip/tooltip.css` | Estilos | ➖ |
| `src/tooltip/index.ts` | Barrel | ➖ |
| `src/tooltip/ngb-tooltip.directive.spec.ts` | | ✅ `getNgModuleName` |

## typeahead

| Archivo | Qué es | Estado |
|---|---|---|
| `src/typeahead/ngb-typeahead.module.ts` | Módulo | ✅ `@NgModule` |
| `src/typeahead/ngb-typeahead.directive.ts` | `[ngbTypeahead]` | ✅ `@Directive` (`ControlValueAccessor`) |
| `src/typeahead/ngb-typeahead-window.ts` | `ngb-typeahead-window` | ✅ `@Component` (falta renombrar a `.component.ts`) |
| `src/typeahead/ngb-typeahead-window.html` | Plantilla | ✅ |
| `src/typeahead/ngb-highlight.component.ts` | `ngb-highlight` | ✅ `@Component` |
| `src/typeahead/ngb-highlight.component.html` | Plantilla | ✅ |
| `src/typeahead/ngb-typeahead-config.service.ts` | `NgbTypeaheadConfig` | ✅ `@Service` |
| `src/typeahead/index.ts` | Barrel | ➖ |
| `src/typeahead/ngb-typeahead.directive.spec.ts` | | ✅ `configureTestBed` |
| `src/typeahead/ngb-typeahead.module.spec.ts` | | ✅ `configureTestBed` |
| `src/typeahead/ngb-typeahead-cva.spec.ts` | | ✅ `configureTestBed` |
| `src/typeahead/ngb-typeahead-window.spec.ts` | | ✅ `configureTestBed` |
| `src/typeahead/ngb-highlight.component.spec.ts` | | ✅ `configureTestBed` |
| `src/typeahead/ngb-typeahead-config.service.spec.ts` | | ✅ unit puro |

---

## Notas de la última tanda de trabajo (contexto)

1. **`popover` migrado** (`f6758ee`): pasó de `$factory`/`IComponentController` a `@Directive`/`@Component`/`@NgModule`, espejo de `tooltip` + upstream `ng-bootstrap`.
2. **`scrollspy-menu` limpiado**: se sacó la mezcla `$onInit`/`$postLink` + `ngAfterViewInit`, quedó solo estilo decoradores.
3. **7 specs corregidos** (`config-services`, `nav`, `pagination`, `progressbar`, `rating`, `tooltip`, `utils/accessibility/live`): `angular.mock.module(NgbModule.name)` → `angular.mock.module(getNgModuleName(NgbModule))`, porque `NgbModule` es una clase y `.name` no es el nombre del módulo AngularJS registrado.
4. **2 bugs de `ngjs-core` arreglados de raíz** (fuera de este repo, en `D:\Repos\projects\ngjs\ngjs-core`):
   - `core/platform/application-ref.ts` → `tick()` corre `afterRenderEventManager.notify()` con `runOutsideAngular(...)`: los callbacks de `afterRender` son no-reactivos (como en Angular). Sin esto, la `Promise` que devuelve `popper.update()` desde un `afterEveryRender` re-disparaba `onMicrotaskEmpty → tick → notify` en loop infinito (colgaba popover/tooltip/dropdown).
   - `runtime/bridges/lifecycle-bridge.ts` → la rama `ngOnDestroy` usa `prependInstanceMethod` + chequeo `authoredOnDestroy` (igual que `ngOnInit`), en vez del guard `typeof inst.$onDestroy !== "function"` que fallaba cuando `output-emitter-bridge` ya había puesto un `$onDestroy` → `ngOnDestroy` no se llamaba nunca en directivas con `@Output` (`popover`, `tooltip`, `dropdown`).
