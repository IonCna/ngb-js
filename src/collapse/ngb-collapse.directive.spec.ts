import { type ComponentFixture, TestBed } from "ngjs-core/testing";
import { createGenericTestComponent, isBrowserVisible } from "../test/common";

import angular from "angular";
import { Component, HostBinding } from "ngjs-core";

import { NgbCollapse } from "./ngb-collapse.directive";
import { NgbCollapseModule } from "./ngb-collapse.module";
import { NgbConfig } from "../config/ngb-config";
import { NgbConfigAnimation } from "../test/ngb-config-animation";

/**
 * Port de `collapse.spec.ts` de ng-bootstrap 16. Diferencias forzadas por AngularJS:
 * - templates en sintaxis de AngularJS: `[ngbCollapse]="collapsed"` → `ngb-collapse="$ctrl.collapsed"`,
 *   `#c="ngbCollapse"` → `ng-ref="$ctrl.c" ng-ref-read="ngbCollapse"`, `[(ngbCollapse)]` → el input más
 *   `ngb-collapse-change="$ctrl.collapsed = $event"`;
 * - sin componentes standalone: `NgbCollapseModule` se importa en el módulo de test;
 * - sin `DebugElement`: la instancia se toma con `angular.element(…).controller()`;
 * - sin el callback `done` de Jasmine: esos tests devuelven una promesa.
 */
const createTestComponent = (html: string) =>
  createGenericTestComponent(html, TestComponent) as ComponentFixture<TestComponent>;

function getCollapsibleContent(element: HTMLElement): HTMLDivElement {
  return <HTMLDivElement>element.querySelector(".collapse");
}

describe("ngb-collapse", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [NgbCollapseModule] });
  });

  it("should have content open", () => {
    const fixture = createTestComponent(`<div ngb-collapse="$ctrl.collapsed">Some content</div>`);

    const collapseEl = getCollapsibleContent(fixture.nativeElement);

    expect(collapseEl).toHaveCssClass("show");
  });

  it(`should set css classes for horizontal collapse`, () => {
    const fixture = createTestComponent(`<div ngb-collapse="$ctrl.collapsed">Some content</div>`);
    const element = fixture.nativeElement.querySelector("[ngb-collapse]") as HTMLElement;
    const directive = angular.element(element).controller("ngbCollapse") as NgbCollapse;

    expect(element).toHaveCssClass("collapse");
    expect(element).not.toHaveCssClass("collapse-horizontal");

    directive.horizontal = true;
    fixture.detectChanges();

    expect(element).toHaveCssClass("collapse");
    expect(element).toHaveCssClass("collapse-horizontal");
  });

  it("should have content closed", () => {
    const fixture = createTestComponent(`<div ngb-collapse="$ctrl.collapsed">Some content</div>`);
    const tc = fixture.componentInstance;
    tc.collapsed = true;
    fixture.detectChanges();

    const collapseEl = getCollapsibleContent(fixture.nativeElement);

    expect(collapseEl).not.toHaveCssClass("show");
  });

  it("should toggle collapsed content based on bound model change", () => {
    const fixture = createTestComponent(`<div ngb-collapse="$ctrl.collapsed">Some content</div>`);
    fixture.detectChanges();

    const tc = fixture.componentInstance;
    const collapseEl = getCollapsibleContent(fixture.nativeElement);
    expect(collapseEl).toHaveCssClass("show");

    tc.collapsed = true;
    fixture.detectChanges();
    expect(collapseEl).not.toHaveCssClass("show");

    tc.collapsed = false;
    fixture.detectChanges();
    expect(collapseEl).toHaveCssClass("show");
  });

  it("should allow toggling collapse from outside", () => {
    const fixture = createTestComponent(`
      <button ng-click="$ctrl.collapse.toggle()">Collapse</button>
      <div ngb-collapse="$ctrl.collapsed" ng-ref="$ctrl.collapse" ng-ref-read="ngbCollapse"></div>`);

    const compiled = fixture.nativeElement;
    const collapseEl = getCollapsibleContent(compiled);
    const buttonEl = compiled.querySelector("button")!;

    buttonEl.click();
    fixture.detectChanges();
    expect(collapseEl).not.toHaveCssClass("show");

    buttonEl.click();
    fixture.detectChanges();
    expect(collapseEl).toHaveCssClass("show");
  });

  it("should work with no binding", () => {
    const fixture = createTestComponent(`
      <button ng-click="$ctrl.collapse.toggle()">Collapse</button>
      <div ngb-collapse ng-ref="$ctrl.collapse" ng-ref-read="ngbCollapse"></div>`);

    const compiled = fixture.nativeElement;
    const collapseEl = getCollapsibleContent(compiled);
    const buttonEl = compiled.querySelector("button")!;

    buttonEl.click();
    fixture.detectChanges();
    expect(collapseEl).not.toHaveCssClass("show");

    buttonEl.click();
    fixture.detectChanges();
    expect(collapseEl).toHaveCssClass("show");
  });
});

if (isBrowserVisible("ngb-collapse animations")) {
  describe("ngb-collapse animations", () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [NgbCollapseModule],
        providers: [{ provide: NgbConfig, useClass: NgbConfigAnimation }],
      });
    });

    it(`should run collapsing transition (force-reduced-motion = false)`, () =>
      new Promise<void>((done) => {
        const fixture = TestBed.createComponent(TestAnimationComponent);
        fixture.componentInstance.reduceMotion = false;
        fixture.detectChanges();

        const buttonEl = fixture.nativeElement.querySelector("button")!;
        const content = getCollapsibleContent(fixture.nativeElement);

        const onCollapseSpy = spyOn(fixture.componentInstance, "onCollapse");
        const onShownSpy = spyOn(fixture.componentInstance, "onShown");
        const onHiddenSpy = spyOn(fixture.componentInstance, "onHidden");

        // First we're going to collapse, then expand
        onHiddenSpy.and.callFake(() => {
          expect(content).toHaveClass("collapse");
          expect(content).not.toHaveClass("show");
          expect(content).not.toHaveClass("collapsing");

          // Expanding
          buttonEl.click();
          fixture.detectChanges();
          expect(onShownSpy).not.toHaveBeenCalled();
          expect(content).not.toHaveClass("collapse");
          expect(content).not.toHaveClass("show");
          expect(content).toHaveClass("collapsing");
        });

        onShownSpy.and.callFake(() => {
          expect(onCollapseSpy).toHaveBeenCalledTimes(2);
          expect(content).toHaveClass("collapse");
          expect(content).toHaveClass("show");
          expect(content).not.toHaveClass("collapsing");

          done();
        });

        expect(content).toHaveClass("collapse");
        expect(content).toHaveClass("show");
        expect(content).not.toHaveClass("collapsing");
        expect(fixture.componentInstance.collapsed).toBe(false);

        // Collapsing
        buttonEl.click();
        fixture.detectChanges();
        expect(onHiddenSpy).not.toHaveBeenCalled();
        expect(onCollapseSpy).toHaveBeenCalledTimes(1);
        expect(content).not.toHaveClass("collapse");
        expect(content).not.toHaveClass("show");
        expect(content).toHaveClass("collapsing");
      }));

    it(`should run collapsing transition (force-reduced-motion = true)`, () => {
      const fixture = TestBed.createComponent(TestAnimationComponent);
      fixture.componentInstance.reduceMotion = true;
      fixture.detectChanges();

      const buttonEl = fixture.nativeElement.querySelector("button")!;
      const content = getCollapsibleContent(fixture.nativeElement);

      const onCollapseSpy = spyOn(fixture.componentInstance, "onCollapse");
      const onShownSpy = spyOn(fixture.componentInstance, "onShown");
      const onHiddenSpy = spyOn(fixture.componentInstance, "onHidden");

      expect(content).toHaveClass("collapse");
      expect(content).toHaveClass("show");
      expect(content).not.toHaveClass("collapsing");
      expect(fixture.componentInstance.collapsed).toBe(false);

      // Collapsing
      buttonEl.click();
      fixture.detectChanges();
      expect(onHiddenSpy).toHaveBeenCalled();
      expect(onCollapseSpy).toHaveBeenCalledTimes(1);
      expect(content).toHaveClass("collapse");
      expect(content).not.toHaveClass("show");
      expect(content).not.toHaveClass("collapsing");

      // Expanding
      buttonEl.click();
      fixture.detectChanges();
      expect(onShownSpy).toHaveBeenCalled();
      expect(onCollapseSpy).toHaveBeenCalledTimes(2);
      expect(content).toHaveClass("collapse");
      expect(content).toHaveClass("show");
      expect(content).not.toHaveClass("collapsing");
    });

    it(`should run revert collapsing transition (force-reduced-motion = false)`, () =>
      new Promise<void>((done) => {
        const fixture = TestBed.createComponent(TestAnimationComponent);
        fixture.componentInstance.reduceMotion = false;
        fixture.detectChanges();

        const buttonEl = fixture.nativeElement.querySelector("button")!;
        const content = getCollapsibleContent(fixture.nativeElement);

        const onCollapseSpy = spyOn(fixture.componentInstance, "onCollapse");
        const onShownSpy = spyOn(fixture.componentInstance, "onShown");
        const onHiddenSpy = spyOn(fixture.componentInstance, "onHidden");

        onShownSpy.and.callFake(() => {
          expect(onHiddenSpy).not.toHaveBeenCalled();
          expect(fixture.componentInstance.collapsed).toBe(false);
          expect(content).toHaveClass("collapse");
          expect(content).toHaveClass("show");
          expect(content).not.toHaveClass("collapsing");
          done();
        });

        expect(content).toHaveClass("collapse");
        expect(content).toHaveClass("show");
        expect(content).not.toHaveClass("collapsing");
        expect(fixture.componentInstance.collapsed).toBe(false);

        // Collapsing
        buttonEl.click();
        fixture.detectChanges();
        expect(onCollapseSpy).toHaveBeenCalledTimes(1);
        expect(content).not.toHaveClass("collapse");
        expect(content).not.toHaveClass("show");
        expect(content).toHaveClass("collapsing");

        // Expanding before hidden
        buttonEl.click();
        fixture.detectChanges();
        expect(onCollapseSpy).toHaveBeenCalledTimes(2);
        expect(content).not.toHaveClass("collapse");
        expect(content).not.toHaveClass("show");
        expect(content).toHaveClass("collapsing");
      }));
  });
}

/** En ng-bootstrap está dentro del `describe`: el compilador solo lee clases de nivel de módulo. */
@Component({
  selector: "test-animation-cmp",
  template: `
    <button ng-click="$ctrl.c.toggle()">Collapse!</button>
    <div
      ngb-collapse="$ctrl.collapsed"
      ng-ref="$ctrl.c"
      ng-ref-read="ngbCollapse"
      ngb-collapse-change="$ctrl.collapsed = $event; $ctrl.onCollapse()"
      shown="$ctrl.onShown()"
      hidden="$ctrl.onHidden()"
    ></div>
  `,
})
class TestAnimationComponent {
  collapsed = false;
  // `host: { "[class.ngb-reduce-motion]": "reduceMotion" }` en ng-bootstrap: `host` no está soportado todavía.
  @HostBinding("class.ngb-reduce-motion") reduceMotion = true;
  onCollapse = () => {};
  onShown = () => {};
  onHidden = () => {};
}

@Component({ selector: "test-cmp", template: "" })
class TestComponent {
  collapsed = false;
}
