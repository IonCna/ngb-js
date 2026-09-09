import { NgbModule as NgbModuleClass } from "@ngb/ngb.module";
import { registerNgModule } from "ngjs-core";

/**
 * `ngb-js/compat` — superficie para apps AngularJS 1.x clásicas (sin
 * `ngjs-core`, sin build step).
 *
 * Cada `Ngb*Module` acá es un **`angular.IModule`** real (via
 * `registerNgModule`), no la clase `@NgModule` del entrypoint moderno. Se agrega
 * a las deps de la app por `.name`:
 *
 * ```js
 * import { NgbModule } from "ngb-js/compat"
 * angular.module("miApp", [NgbModule.name])            // "ngb", agrega todo
 * // o granular:
 * import { NgbAlertModule, NgbModalModule } from "ngb-js/compat"
 * angular.module("miApp", [NgbAlertModule.name, NgbModalModule.name])
 * ```
 *
 * Cada feature además expone su propio `…/compat` (`ngb-js/alert/compat`, …) con
 * los tokens/tipos de esa feature; este barrel reexporta sólo los `IModule`.
 */

/** `angular.IModule` `"ngb"` — agrega toda la librería. */
export const NgbModule = registerNgModule(NgbModuleClass);

export { NgbAccordionModule } from "@ngb/accordion/compat";
export { NgbAlertModule } from "@ngb/alert/compat";
export { NgbCarouselModule } from "@ngb/carousel/compat";
export { NgbCollapseModule } from "@ngb/collapse/compat";
export { NgbDatepickerModule } from "@ngb/datepicker/compat";
export { NgbDropdownModule } from "@ngb/dropdown/compat";
export { NgbModalModule } from "@ngb/modal/compat";
export { NgbNavModule } from "@ngb/nav/compat";
export { NgbConfig } from "@ngb/ngb-config.service";
export { NgbOffcanvasModule } from "@ngb/offcanvas/compat";
export { NgbPaginationModule } from "@ngb/pagination/compat";
export { NgbPopoverModule } from "@ngb/popover/compat";
export { NgbProgressbarModule } from "@ngb/progressbar/compat";
export { NgbRatingModule } from "@ngb/rating/compat";
export { NgbScrollSpyModule } from "@ngb/scrollspy/compat";
export { NgbTimepickerModule } from "@ngb/timepicker/compat";
export { NgbToastModule } from "@ngb/toast/compat";
export { NgbTooltipModule } from "@ngb/tooltip/compat";
export { NgbTypeaheadModule } from "@ngb/typeahead/compat";
