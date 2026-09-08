import { Directive } from "ngjs-core";

/**
 * Marca la `<ng-template>` que lleva el contenido de un tab. El `TemplateRef` se
 * obtiene con `@ContentChild(NgbNavContent, { read: TemplateRef })` desde
 * `NgbNavItem` — no hace falta `inject(TemplateRef)` acá (que en AngularJS no
 * resuelve en un field initializer sobre `<ng-template>` por el `transclude:'element'`).
 */
@Directive({ selector: "ng-template[ngbNavContent]" })
export class NgbNavContent {}
