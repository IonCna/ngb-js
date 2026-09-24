import { type ComponentFixture, inject, TestBed } from "ngjs-core/testing";
import { createGenericTestComponent, isBrowserVisible } from "../test/common";

import angular from "angular";
import { Component, type ElementRef, HostBinding, Inject, type QueryList, ViewChild, ViewChildren } from "ngjs-core";

import { NgbAccordionDirective } from "./ngb-accordion.directive";
import { NgbAccordionModule } from "./ngb-accordion.module";
import { NgbAccordionConfig } from "./ngb-accordion-config.service";
import { NgbAccordionItem } from "./ngb-accordion-item.directive";
import { NgbConfig } from "../config/ngb-config";
import { NgbConfigAnimation } from "../test/ngb-config-animation";

/**
 * Port de `accordion.directive.spec.ts` de ng-bootstrap 16. Diferencias forzadas por AngularJS:
 * - templates en sintaxis de AngularJS: `[x]="y"` → `x="$ctrl.y"`, `(x)="f($event)"` → `x="$ctrl.f($event)"`,
 *   `@for` → `ng-repeat` (`$index`), `#acc="ngbAccordion"` → `ng-ref="acc" ng-ref-read="ngbAccordion"`;
 * - sin componentes standalone: `NgbAccordionModule` se importa en el módulo de test (`beforeEach` de arriba);
 * - los componentes que ng-bootstrap declara dentro de un `describe`/`it` van a nivel de módulo (el compilador solo
 *   lee esas), y `QueryTestComponent` lleva selector (sin standalone no hay componente sin selector);
 * - sin `DebugElement`: la directiva se toma con `angular.element(…).controller()`;
 * - sin el callback `done` de Jasmine: esos tests devuelven una promesa;
 * - sin `ChangeDetectionStrategy.OnPush` (AngularJS no lo tiene): el test de OnPush corre con la detección normal.
 */
const createTestComponent = (html: string) =>
  createGenericTestComponent(html, TestComponent) as ComponentFixture<TestComponent>;

function getCollapses(element: HTMLElement): HTMLDivElement[] {
  return <HTMLDivElement[]>Array.from(element.querySelectorAll(".accordion-item > .accordion-collapse"));
}

function getCollapseContent(element: HTMLElement): HTMLDivElement[] {
  return <HTMLDivElement[]>(
    Array.from(element.querySelectorAll(".accordion-item > .collapse.accordion-collapse > .accordion-body"))
  );
}

function getPanelsButtons(element: HTMLElement): HTMLButtonElement[] {
  return <HTMLButtonElement[]>Array.from(element.querySelectorAll(".accordion-item > .accordion-header button"));
}

function getPanelsTitle(element: HTMLElement): string[] {
  return getPanelsButtons(element).map((button) => button.textContent!.trim());
}

function getCollapseBodyContent(collapseElement: HTMLElement): string {
  return collapseElement.querySelector(".accordion-body")!.textContent!.trim();
}

function getHeaders(element: HTMLElement): HTMLElement[] {
  return <HTMLButtonElement[]>Array.from(element.querySelectorAll(".accordion-item > .accordion-heading"));
}

function getButton(element: HTMLElement, index: number): HTMLButtonElement {
  return <HTMLButtonElement>element.querySelectorAll('button[type="button"]')[index];
}

function getItem(element: HTMLElement, index: number): HTMLElement {
  return <HTMLElement>element.querySelectorAll(".accordion-item")[index];
}

function getItemsIds(element: HTMLElement): string[] {
  return Array.from(element.querySelectorAll(".accordion-item")).map((el) => el.id);
}

/** `fixture.debugElement.query(By.directive(NgbAccordionDirective)).injector.get(NgbAccordionDirective)`. */
function getAccordionDirective(element: HTMLElement): NgbAccordionDirective {
  return angular.element(element.querySelector("[ngb-accordion]")!).controller("ngbAccordion") as NgbAccordionDirective;
}

function expectOpenPanels(nativeEl: HTMLElement, openPanelsDef: boolean[]) {
  const noOfOpenPanelsExpected = openPanelsDef.reduce((soFar, def) => (def ? soFar + 1 : soFar), 0);
  const collapseElements = getCollapses(nativeEl);
  expect(collapseElements.length).toBe(openPanelsDef.length);

  const panelsButton = getPanelsButtons(nativeEl);
  const result = panelsButton.map((titleEl) => {
    const isAriaExpanded = titleEl.getAttribute("aria-expanded") === "true";
    const isCSSCollapsed = titleEl.classList.contains("collapsed");
    return isAriaExpanded === !isCSSCollapsed ? isAriaExpanded : fail("inconsistent state");
  });
  const noOfOpenPanels = collapseElements
    .map((collapse) => {
      return collapse.classList.contains("show");
    })
    .reduce((soFar, def) => (def ? soFar + 1 : soFar), 0);

  expect(noOfOpenPanels).toBe(noOfOpenPanelsExpected);
  expect(result).toEqual(openPanelsDef);
}

beforeEach(() => {
  TestBed.configureTestingModule({ imports: [NgbAccordionModule] });
});

describe("ngb-accordion directive", () => {
  let html = `
    <div ngb-accordion ng-ref="acc" ng-ref-read="ngbAccordion"
      close-others="$ctrl.closeOthers" destroy-on-hide="$ctrl.destroyOnHide"
      show="$ctrl.showCallback($event)" hide="$ctrl.hideCallback($event)"
      shown="$ctrl.shownCallback($event)" hidden="$ctrl.hiddenCallback($event)">
      <div ngb-accordion-item ng-repeat="item in $ctrl.items"
        disabled="item.disabled"
        collapsed="item.collapsed"
        destroy-on-hide="item.destroyOnHide"
        show="$ctrl.itemShowCallback($event)"
        shown="$ctrl.itemShownCallback($event)"
        hide="$ctrl.itemHideCallback($event)"
        hidden="$ctrl.itemHiddenCallback($event)"
        >
        <h2 ngb-accordion-header>
          <button ngb-accordion-button>{{item.header}}</button>
        </h2>
        <div ngb-accordion-collapse>
          <div ngb-accordion-body><ng-template>{{item.body}}</ng-template></div>
        </div>
      </div>
    </div>
    <button ng-repeat="panel in $ctrl.panels" ng-click="acc.toggle(panel.id)">Toggle the panel {{ panel.id }}</button>
  `;
  beforeEach(() => {
    TestBed.overrideComponent(TestComponent, { set: { template: html } });
  });

  it("should initialize inputs with default values", () => {
    const defaultConfig = TestBed.inject(NgbAccordionConfig);

    TestBed.runInInjectionContext(() => {
      let accordion = new NgbAccordionDirective();
      expect(accordion.closeOthers).toBe(defaultConfig.closeOthers);
      expect(accordion.animation).toBe(defaultConfig.animation);
    });
  });

  it("should have no open panels", () => {
    const fixture = TestBed.createComponent(TestComponent);
    const el = fixture.nativeElement;
    fixture.detectChanges();
    expectOpenPanels(el, [false, false, false]);
  });

  it("should have proper css classes", () => {
    const fixture = TestBed.createComponent(TestComponent);
    const accordion = fixture.nativeElement.querySelector("[ngb-accordion]")!;
    fixture.detectChanges();
    expect(accordion).toHaveCssClass("accordion");
  });

  it("should have the appropriate collapse", () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement;
    const collapses = getCollapses(el);
    const buttons = getPanelsButtons(el);
    collapses.forEach((collapse, idx) => {
      expect(collapse.getAttribute("aria-labelledby")).toBe(buttons[idx]!.id);
      expect(collapse).toHaveCssClass("collapse");
    });
  });

  it("should toggle panels independently", () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement;

    getButton(el, 1).click();
    fixture.detectChanges();
    expectOpenPanels(el, [false, true, false]);

    getButton(el, 0).click();
    fixture.detectChanges();
    expectOpenPanels(el, [true, true, false]);

    getButton(el, 1).click();
    fixture.detectChanges();
    expectOpenPanels(el, [true, false, false]);

    getButton(el, 2).click();
    fixture.detectChanges();

    expectOpenPanels(el, [true, false, true]);

    getButton(el, 0).click();
    fixture.detectChanges();
    expectOpenPanels(el, [false, false, true]);

    getButton(el, 2).click();
    fixture.detectChanges();
    expectOpenPanels(el, [false, false, false]);
  });

  it('should allow only one panel to be active with "closeOthers" flag', () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    fixture.componentInstance.closeOthers = true;
    const el = fixture.nativeElement;

    fixture.detectChanges();

    getButton(el, 0).click();
    fixture.detectChanges();
    expectOpenPanels(el, [true, false, false]);

    getButton(el, 1).click();
    fixture.detectChanges();
    expectOpenPanels(el, [false, true, false]);
  });

  it("should have the appropriate heading", () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement;

    const titles = getPanelsTitle(el);
    expect(titles.length).not.toBe(0);
    titles.forEach((title, idx) => {
      expect(title).toBe(`Panel ${idx + 1}`);
    });
  });

  it("should not crash for an empty accordion", () => {
    const fixture = createTestComponent("<div ngb-accordion></div>");
    expect(getCollapses(fixture.nativeElement).length).toBe(0);
  });

  it("should not crash for panels without content", () => {
    const fixture = createTestComponent(
      `<div ngb-accordion>
        <div ngb-accordion-item>
          <h2 ngb-accordion-header><button ngb-accordion-button>Toggle</button></h2>
          <div ngb-accordion-collapse><div ngb-accordion-body></div></div>
        </div>
      </div>`,
    );
    const panelsContent = getCollapseContent(fixture.nativeElement);

    expect(panelsContent.length).toBe(1);
    expect(panelsContent[0]!.textContent!.trim()).toBe("");
  });

  it("should have the appropriate content", () => {
    const fixture = TestBed.createComponent(TestComponent);
    const originalItems = fixture.componentInstance.items;
    originalItems.forEach((item) => (item.destroyOnHide = false));
    fixture.detectChanges();

    getCollapses(fixture.nativeElement).forEach((collapse, idx) => {
      expect(getCollapseBodyContent(collapse)).toBe(originalItems[idx]!.body);
    });
  });

  it("should remove body content from DOM", () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.componentInstance.items.forEach((item) => (item.destroyOnHide = true));
    fixture.detectChanges();

    getCollapses(fixture.nativeElement).forEach((collapse) => {
      expect(getCollapseBodyContent(collapse)).toBe("");
    });
  });

  it("should not remove body content if destroyOnHide is false on the accordion and unset for the items", () => {
    const fixture = createTestComponent(
      `<div ngb-accordion destroy-on-hide="false">
        <div ngb-accordion-item ng-repeat="item in $ctrl.items">
          <h2 ngb-accordion-header>
            <button ngb-accordion-button>{{item.header}}</button>
          </h2>
          <div ngb-accordion-collapse>
            <div ngb-accordion-body><ng-template>{{item.body}}</ng-template></div>
          </div>
        </div>
      </div>`,
    );
    fixture.detectChanges();

    getCollapses(fixture.nativeElement).forEach((collapse, idx) => {
      expect(getCollapseBodyContent(collapse)).toBe(fixture.componentInstance.items[idx]!.body);
    });
  });

  it("should respect destroyOnHide on the accordion-item if is set in accordion and accordion-item", () => {
    const fixture = createTestComponent(
      `<div ngb-accordion destroy-on-hide="false">
        <div ngb-accordion-item ng-repeat="item in $ctrl.items" destroy-on-hide="item.destroyOnHide">
          <h2 ngb-accordion-header>
            <button ngb-accordion-button>{{item.header}}</button>
          </h2>
          <div ngb-accordion-collapse>
            <div ngb-accordion-body><ng-template>{{item.body}}</ng-template></div>
          </div>
        </div>
      </div>`,
    );
    fixture.componentInstance.items[0]!.destroyOnHide = true;
    fixture.detectChanges();

    getCollapses(fixture.nativeElement).forEach((collapse, idx) => {
      expect(getCollapseBodyContent(collapse)).toBe(idx === 0 ? "" : fixture.componentInstance.items[idx]!.body);
    });
  });

  it(`should allow customizing headers with 'NgbAccordionToggle'`, () => {
    const fixture = createTestComponent(
      `<div ngb-accordion>
        <div ng-repeat="item in $ctrl.items" ngb-accordion-item="'custom-' + $index">
          <div ngb-accordion-header class='accordion-button'>
            <button type='button' ngb-accordion-toggle>{{item.header}}</button>
          </div>
          <div ngb-accordion-collapse>
            <div ngb-accordion-body><ng-template>{{item.body}}</ng-template></div>
          </div>
        </div>
      </div>`,
    );

    fixture.detectChanges();

    const el = fixture.nativeElement;
    expectOpenPanels(el, [false, false, false]);

    // open second
    getButton(el, 1).click();
    fixture.detectChanges();
    expectOpenPanels(el, [false, true, false]);

    // close second
    getButton(el, 1).click();
    fixture.detectChanges();
    expectOpenPanels(el, [false, false, false]);
  });

  it(`should no allow clicking on disabled headers with 'NgbAccordionToggle'`, () => {
    const fixture = createTestComponent(
      `<div ngb-accordion>
        <div ngb-accordion-item disabled="true">
          <div ngb-accordion-header class="accordion-button">
            <button type='button' ngb-accordion-toggle>Toggle</button>
          </div>
          <div ngb-accordion-collapse>
            <div ngb-accordion-body><ng-template>Body</ng-template></div>
          </div>
        </div>
      </div>`,
    );

    fixture.detectChanges();

    const el = fixture.nativeElement;
    expectOpenPanels(el, [false]);

    // user click should not open the panel
    getButton(el, 0).click();
    fixture.detectChanges();
    expectOpenPanels(el, [false]);
  });

  it("should remove body content from DOM only for the first collapse", () => {
    const fixture = TestBed.createComponent(TestComponent);
    const originalItems = fixture.componentInstance.items;
    originalItems[0]!.destroyOnHide = true;
    getCollapses(fixture.nativeElement).forEach((collapse, idx) => {
      if (idx === 0) {
        expect(getCollapseBodyContent(collapse)).toBe("");
      } else {
        expect(getCollapseBodyContent(collapse)).toBe(originalItems[idx]!.body);
      }
    });
  });

  it("should have a custom panel id", () => {
    const fixture = createTestComponent(
      `<div ngb-accordion>
        <div ng-repeat="item in $ctrl.items" ngb-accordion-item="'custom-' + $index">
          <h2 ngb-accordion-header>
            <button ngb-accordion-button>{{item.header}}</button>
          </h2>
          <div ngb-accordion-collapse>
            <div ngb-accordion-body><ng-template>{{item.body}}</ng-template></div>
          </div>
        </div>
      </div>`,
    );
    expect(getItemsIds(fixture.nativeElement)).toEqual(["custom-0", "custom-1", "custom-2"]);
  });

  it("should remove body content from DOM if destroyOnHide is not set on accordion and on accordion-item", () => {
    const fixture = createTestComponent(
      `<div ngb-accordion>
        <div ngb-accordion-item ng-repeat="item in $ctrl.items">
          <h2 ngb-accordion-header>
            <button ngb-accordion-button>{{item.header}}</button>
          </h2>
          <div ngb-accordion-collapse>
            <div ngb-accordion-body><ng-template>{{item.body}}</ng-template></div>
          </div>
        </div>
      </div>`,
    );

    getCollapses(fixture.nativeElement).forEach((collapse) => {
      expect(getCollapseBodyContent(collapse)).toBe("");
    });
  });

  it("should not toggle disabled items", () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.componentInstance.items[0]!.disabled = true;
    const el = fixture.nativeElement;

    fixture.detectChanges();
    expectOpenPanels(el, [false, false, false]);

    getButton(el, 0).click();
    fixture.detectChanges();
    expectOpenPanels(el, [false, false, false]);
  });

  it("should not change collapse when panels are disabled", () => {
    const fixture = TestBed.createComponent(TestComponent);
    const oItems = fixture.componentInstance.items;
    const el = fixture.nativeElement;
    oItems[0]!.collapsed = false;
    fixture.detectChanges();
    expectOpenPanels(el, [true, false, false]);

    oItems[0]!.disabled = true;
    fixture.detectChanges();
    expectOpenPanels(el, [true, false, false]);

    oItems[0]!.disabled = false;
    fixture.detectChanges();
    expectOpenPanels(el, [true, false, false]);

    getButton(el, 0).click();
    fixture.detectChanges();
    expectOpenPanels(el, [false, false, false]);
  });

  it("should have correct disabled state", () => {
    const fixture = TestBed.createComponent(TestComponent);
    const oItems = fixture.componentInstance.items;
    const el = fixture.nativeElement;

    oItems[0]!.collapsed = false;
    fixture.detectChanges();
    const toggleButtons = getPanelsButtons(el);
    expectOpenPanels(el, [true, false, false]);
    expect(toggleButtons[0]!.disabled).toBeFalsy();

    oItems[0]!.disabled = true;
    fixture.detectChanges();
    expectOpenPanels(el, [true, false, false]);
    expect(toggleButtons[0]!.disabled).toBeTruthy();
  });

  it(`should allow using 'ngbAccordionItem' from the template`, () => {
    const fixture = createTestComponent(
      `<div ngb-accordion>
          <div ngb-accordion-item="'item'" ng-ref="item" ng-ref-read="ngbAccordionItem" collapsed="false">
            <h2 ngb-accordion-header>
              <button ngb-accordion-button>{{ item.collapsed ? 'collapsed-' : 'expanded-' }}{{ item.disabled ? 'disabled' : 'enabled' }}</button>
            </h2>
            <div ngb-accordion-collapse><div ngb-accordion-body></div></div>
          </div>
        </div>
        <button id="btn-toggle" ng-click='item.toggle()'></button>
        <button id="btn-expand" ng-click='item.collapsed = false'></button>
        <button id="btn-disable" ng-click='item.disabled = true'></button>`,
    );

    const el = fixture.nativeElement;

    // initial state
    expect(getPanelsTitle(el)).toEqual(["expanded-enabled"]);

    // toggling via item.toggle()
    el.querySelector<HTMLElement>("#btn-toggle")!.click();
    fixture.detectChanges();
    expect(getPanelsTitle(el)).toEqual(["collapsed-enabled"]);

    // expanding via item.collapsed = false
    el.querySelector<HTMLElement>("#btn-expand")!.click();
    fixture.detectChanges();
    expect(getPanelsTitle(el)).toEqual(["expanded-enabled"]);

    // changing disabled state via item.disabled = true
    el.querySelector<HTMLElement>("#btn-disable")!.click();
    fixture.detectChanges();
    expect(getPanelsTitle(el)).toEqual(["expanded-disabled"]);
  });

  it(`should allow using 'ngbAccordionItem' from the template in a loop`, () => {
    const fixture = createTestComponent(
      `<div ngb-accordion>
        <div ng-repeat="i in $ctrl.items" ngb-accordion-item ng-ref="item" ng-ref-read="ngbAccordionItem" collapsed='i.collapsed' disabled='i.disabled'>
          <h2 ngb-accordion-header>
            <button ngb-accordion-button>{{ item.collapsed ? 'collapsed-' : 'expanded-' }}{{ item.disabled ? 'disabled' : 'enabled' }}</button>
          </h2>
          <div ngb-accordion-collapse><div ngb-accordion-body></div></div>
        </div>
      </div>`,
    );
    const el = fixture.nativeElement;

    expect(getPanelsTitle(el)).toEqual(["collapsed-enabled", "collapsed-enabled", "collapsed-enabled"]);

    fixture.componentInstance.items[1]!.disabled = true;
    fixture.componentInstance.items[0]!.collapsed = false;
    fixture.detectChanges();

    expect(getPanelsTitle(el)).toEqual(["expanded-enabled", "collapsed-disabled", "collapsed-enabled"]);
  });

  it("should emit panel events when toggling panels", () => {
    const fixture = TestBed.createComponent(TestComponent);
    const el = fixture.nativeElement;
    const ci = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(ci, "showCallback");
    spyOn(ci, "shownCallback");
    spyOn(ci, "hideCallback");
    spyOn(ci, "hiddenCallback");
    spyOn(ci, "itemShowCallback");
    spyOn(ci, "itemShownCallback");
    spyOn(ci, "itemHideCallback");
    spyOn(ci, "itemHiddenCallback");

    getButton(el, 0).click();
    fixture.detectChanges();
    const itemId = getItem(el, 0).id;

    expect(fixture.componentInstance.showCallback).toHaveBeenCalledWith(itemId);
    expect(fixture.componentInstance.shownCallback).toHaveBeenCalledWith(itemId);
    expect(fixture.componentInstance.itemShowCallback).toHaveBeenCalledWith(undefined);
    expect(fixture.componentInstance.itemShownCallback).toHaveBeenCalledWith(undefined);

    getButton(el, 0).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.hideCallback).toHaveBeenCalledWith(itemId);
    expect(fixture.componentInstance.hiddenCallback).toHaveBeenCalledWith(itemId);
    expect(fixture.componentInstance.itemHideCallback).toHaveBeenCalledWith(undefined);
    expect(fixture.componentInstance.itemHiddenCallback).toHaveBeenCalledWith(undefined);
  });

  it("should have the proper roles", () => {
    const fixture = TestBed.createComponent(TestComponent);
    const items = fixture.componentInstance.items;
    const el = fixture.nativeElement;
    items.forEach((item) => {
      item.collapsed = false;
    });
    fixture.detectChanges();

    getHeaders(el).forEach((header) => expect(header.getAttribute("role")).toBe("heading"));

    getCollapses(el).forEach((collapse) => expect(collapse.getAttribute("role")).toBe("region"));
  });

  it(`should toggle '.collapsed' class on header when panel is toggled`, () => {
    const fixture = createTestComponent(`
      <div ngb-accordion>
        <div ngb-accordion-item collapsed="false">
          <div ngb-accordion-header><button ngb-accordion-toggle>Toggle</button></div>
          <div ngb-accordion-collapse><div ngb-accordion-body></div></div>
        </div>
      </div>
    `);

    const header = fixture.nativeElement.querySelector("[ngb-accordion-header]")!;
    const toggle = fixture.nativeElement.querySelector<HTMLElement>("[ngb-accordion-toggle]")!;

    expect(header).not.toHaveCssClass("collapsed");

    toggle.click();
    fixture.detectChanges();
    expect(header).toHaveCssClass("collapsed");
  });

  describe("closeOthers", () => {
    it(`should allow expanding one panel initially`, () => {
      TestBed.overrideProvider("state", { useValue: [true, false, true] });
      const fixture = TestBed.createComponent(CloseOthersComponent);
      fixture.detectChanges();
      expect(getPanelsTitle(fixture.nativeElement)).toEqual(["true", "false", "true"]);
    });

    it(`should work with one panel opened initially + collapse on click`, () => {
      TestBed.overrideProvider("state", { useValue: [true, false, true] });
      const fixture = TestBed.createComponent(CloseOthersComponent);
      fixture.detectChanges();

      getButton(fixture.nativeElement, 1).click();
      fixture.detectChanges();
      expect(getPanelsTitle(fixture.nativeElement)).toEqual(["true", "true", "true"]);
    });

    it(`should work with one panel opened initially + collapse on item.toggle()`, () => {
      TestBed.overrideProvider("state", { useValue: [true, false, true] });
      const fixture = TestBed.createComponent(CloseOthersComponent);
      fixture.detectChanges();

      fixture.componentInstance.items.get(1)!.toggle();
      fixture.detectChanges();
      expect(getPanelsTitle(fixture.nativeElement)).toEqual(["true", "true", "true"]);
    });

    it(`should work with one panel opened initially + collapse on item.collapse = true`, () => {
      TestBed.overrideProvider("state", { useValue: [true, false, true] });
      const fixture = TestBed.createComponent(CloseOthersComponent);
      fixture.detectChanges();

      fixture.componentInstance.items.get(1)!.collapsed = true;
      fixture.detectChanges();
      expect(getPanelsTitle(fixture.nativeElement)).toEqual(["true", "true", "true"]);
    });

    it(`should work with one panel opened initially + collapse on accordion.toggle(item)`, () => {
      TestBed.overrideProvider("state", { useValue: [true, false, true] });
      const fixture = TestBed.createComponent(CloseOthersComponent);
      fixture.detectChanges();

      fixture.componentInstance.accordion.toggle("two");
      fixture.detectChanges();
      expect(getPanelsTitle(fixture.nativeElement)).toEqual(["true", "true", "true"]);
    });

    it(`should work with one panel opened initially + expand on click`, () => {
      TestBed.overrideProvider("state", { useValue: [true, false, true] });
      const fixture = TestBed.createComponent(CloseOthersComponent);
      fixture.detectChanges();

      getButton(fixture.nativeElement, 0).click();
      fixture.detectChanges();
      expect(getPanelsTitle(fixture.nativeElement)).toEqual(["false", "true", "true"]);
    });

    it(`should work with one panel opened initially + expand on item.toggle()`, () => {
      TestBed.overrideProvider("state", { useValue: [true, false, true] });
      const fixture = TestBed.createComponent(CloseOthersComponent);
      fixture.detectChanges();

      fixture.componentInstance.items.get(0)!.toggle();
      fixture.detectChanges();
      expect(getPanelsTitle(fixture.nativeElement)).toEqual(["false", "true", "true"]);
    });

    it(`should work with one panel opened initially + expand on item.collapse = false`, () => {
      TestBed.overrideProvider("state", { useValue: [true, false, true] });
      const fixture = TestBed.createComponent(CloseOthersComponent);
      fixture.detectChanges();

      fixture.componentInstance.items.get(0)!.collapsed = false;
      fixture.detectChanges();
      expect(getPanelsTitle(fixture.nativeElement)).toEqual(["false", "true", "true"]);
    });

    it(`should work with one panel opened initially + expand on accordion.toggle(item)`, () => {
      TestBed.overrideProvider("state", { useValue: [true, false, true] });
      const fixture = TestBed.createComponent(CloseOthersComponent);
      fixture.detectChanges();

      fixture.componentInstance.accordion.toggle("one");
      fixture.detectChanges();
      expect(getPanelsTitle(fixture.nativeElement)).toEqual(["false", "true", "true"]);
    });

    it(`should not allow expanding multiple panels initially`, () => {
      TestBed.overrideProvider("state", { useValue: [false, false, false, true] });
      const fixture = TestBed.createComponent(CloseOthersComponent);
      fixture.detectChanges();
      expect(getPanelsTitle(fixture.nativeElement)).toEqual(["false", "true", "true", "true"]);
    });
  });

  describe("imperative API", () => {
    function createTestImperativeAccordion(testHtml: string) {
      const fixture = createTestComponent(testHtml);
      const accordionDirective = getAccordionDirective(fixture.nativeElement);
      const nativeElement = fixture.nativeElement;
      return { fixture, accordionDirective, nativeElement };
    }

    it(`ensure methods don't fail when called before view init`, () => {
      TestBed.runInInjectionContext(() => {
        const accordion = new NgbAccordionDirective();
        accordion.toggle("one");
        accordion.collapse("one");
        accordion.expand("one");
        accordion.expandAll();
        accordion.collapseAll();
        accordion.isExpanded("one");
      });
    });

    it("should check if a panel with a given id is expanded", () => {
      const html = `
        <div ngb-accordion>
          <div ngb-accordion-item collapsed="false">
            <h2 ngb-accordion-header><button ngb-accordion-button>Toggle</button></h2>
            <div ngb-accordion-collapse><div ngb-accordion-body></div></div>
          </div>
          <div ngb-accordion-item>
            <h2 ngb-accordion-header><button ngb-accordion-button>Toggle</button></h2>
            <div ngb-accordion-collapse><div ngb-accordion-body></div></div>
          </div>
        </div>`;
      const { accordionDirective, nativeElement } = createTestImperativeAccordion(html);
      expectOpenPanels(nativeElement, [true, false]);
      const ids = getItemsIds(nativeElement);
      expect(accordionDirective.isExpanded(ids[0]!)).toBe(true);
      expect(accordionDirective.isExpanded(ids[1]!)).toBe(false);
    });

    it("should expanded and collapse individual panels", () => {
      const html = `
      <div ngb-accordion>
        <div ngb-accordion-item>
          <h2 ngb-accordion-header><button ngb-accordion-button>Toggle</button></h2>
          <div ngb-accordion-collapse><div ngb-accordion-body></div></div>
        </div>
        <div ngb-accordion-item>
          <h2 ngb-accordion-header><button ngb-accordion-button>Toggle</button></h2>
          <div ngb-accordion-collapse><div ngb-accordion-body></div></div>
        </div>
      </div>
      `;
      const { accordionDirective, nativeElement, fixture } = createTestImperativeAccordion(html);
      const ids = getItemsIds(nativeElement);

      expectOpenPanels(nativeElement, [false, false]);

      accordionDirective.expand(ids[0]!);
      fixture.detectChanges();
      expectOpenPanels(nativeElement, [true, false]);

      accordionDirective.expand(ids[1]!);
      fixture.detectChanges();
      expectOpenPanels(nativeElement, [true, true]);

      accordionDirective.collapse(ids[1]!);
      fixture.detectChanges();
      expectOpenPanels(nativeElement, [true, false]);
    });

    it("should not expand / collapse if already expanded / collapsed", () => {
      const testHtml = `
      <div ngb-accordion hidden="$ctrl.hiddenCallback($event)" shown="$ctrl.shownCallback($event)">
        <div ngb-accordion-item collapsed="false">
          <h2 ngb-accordion-header><button ngb-accordion-button>Toggle</button></h2>
          <div ngb-accordion-collapse><div ngb-accordion-body></div></div>
        </div>
        <div ngb-accordion-item>
          <h2 ngb-accordion-header><button ngb-accordion-button>Toggle</button></h2>
          <div ngb-accordion-collapse><div ngb-accordion-body></div></div>
        </div>
      </div>`;

      const { accordionDirective, nativeElement, fixture } = createTestImperativeAccordion(testHtml);
      const ids = getItemsIds(nativeElement);
      expectOpenPanels(nativeElement, [true, false]);

      spyOn(fixture.componentInstance, "hiddenCallback");
      spyOn(fixture.componentInstance, "shownCallback");

      accordionDirective.expand(ids[0]!);
      fixture.detectChanges();
      expectOpenPanels(nativeElement, [true, false]);
      expect(fixture.componentInstance.shownCallback).not.toHaveBeenCalled();

      accordionDirective.collapse(ids[1]!);
      fixture.detectChanges();
      expectOpenPanels(nativeElement, [true, false]);
      expect(fixture.componentInstance.hiddenCallback).not.toHaveBeenCalled();
    });

    it("should close panel open when close others is true and another one gets toggled", () => {
      const testHtml = `
      <div ngb-accordion close-others="true">
        <div ngb-accordion-item>
          <h2 ngb-accordion-header><button ngb-accordion-button>Toggle</button></h2>
          <div ngb-accordion-collapse><div ngb-accordion-body></div></div>
        </div>
        <div ngb-accordion-item collapsed="false">
          <h2 ngb-accordion-header><button ngb-accordion-button>Toggle</button></h2>
          <div ngb-accordion-collapse><div ngb-accordion-body></div></div>
        </div>
      </div>`;
      const { accordionDirective, nativeElement, fixture } = createTestImperativeAccordion(testHtml);
      const ids = getItemsIds(nativeElement);
      expectOpenPanels(nativeElement, [false, true]);
      accordionDirective.expand(ids[0]!);
      fixture.detectChanges();
      expectOpenPanels(nativeElement, [true, false]);
    });

    it("should expand disabled panels", () => {
      const testHtml = `
      <div ngb-accordion shown="$ctrl.shownCallback($event)">
        <div ngb-accordion-item disabled="true">
          <h2 ngb-accordion-header><button ngb-accordion-button>Toggle</button></h2>
          <div ngb-accordion-collapse><div ngb-accordion-body></div></div>
        </div>
      </div>`;
      const { accordionDirective, nativeElement, fixture } = createTestImperativeAccordion(testHtml);
      const ids = getItemsIds(nativeElement);

      expectOpenPanels(nativeElement, [false]);

      spyOn(fixture.componentInstance, "shownCallback");

      accordionDirective.expand(ids[0]!);
      fixture.detectChanges();
      expectOpenPanels(nativeElement, [true]);
      expect(fixture.componentInstance.shownCallback).toHaveBeenCalled();
    });

    it("should expandAll when closeOthers is false", () => {
      const testHtml = `
      <div ngb-accordion close-others="false">
        <div ngb-accordion-item>
          <h2 ngb-accordion-header><button ngb-accordion-button>Toggle</button></h2>
          <div ngb-accordion-collapse><div ngb-accordion-body></div></div>
        </div>
        <div ngb-accordion-item>
          <h2 ngb-accordion-header><button ngb-accordion-button>Toggle</button></h2>
          <div ngb-accordion-collapse><div ngb-accordion-body></div></div>
        </div>
      </div>`;

      const { accordionDirective, nativeElement, fixture } = createTestImperativeAccordion(testHtml);

      expectOpenPanels(nativeElement, [false, false]);

      accordionDirective.expandAll();
      fixture.detectChanges();
      expectOpenPanels(nativeElement, [true, true]);
    });

    it("should expand only first panel when closeOthers is true and none of panels is expanded", () => {
      const testHtml = `
      <div ngb-accordion close-others="true">
        <div ngb-accordion-item>
          <h2 ngb-accordion-header><button ngb-accordion-button>Toggle</button></h2>
          <div ngb-accordion-collapse><div ngb-accordion-body></div></div>
        </div>
        <div ngb-accordion-item>
          <h2 ngb-accordion-header><button ngb-accordion-button>Toggle</button></h2>
          <div ngb-accordion-collapse><div ngb-accordion-body></div></div>
        </div>
      </div>`;

      const { accordionDirective, nativeElement, fixture } = createTestImperativeAccordion(testHtml);

      expectOpenPanels(nativeElement, [false, false]);

      accordionDirective.expandAll();
      fixture.detectChanges();
      expectOpenPanels(nativeElement, [true, false]);
    });

    it("should do nothing if closeOthers is true and one panel is expanded", () => {
      const testHtml = `
      <div ngb-accordion close-others="true">
        <div ngb-accordion-item>
          <h2 ngb-accordion-header><button ngb-accordion-button>Toggle</button></h2>
          <div ngb-accordion-collapse><div ngb-accordion-body></div></div>
        </div>
        <div ngb-accordion-item collapsed="false">
          <h2 ngb-accordion-header><button ngb-accordion-button>Toggle</button></h2>
          <div ngb-accordion-collapse><div ngb-accordion-body></div></div>
        </div>
      </div>`;

      const { accordionDirective, nativeElement, fixture } = createTestImperativeAccordion(testHtml);

      expectOpenPanels(nativeElement, [false, true]);

      accordionDirective.expandAll();
      fixture.detectChanges();
      expectOpenPanels(nativeElement, [false, true]);
    });

    it("should collapse all panels", () => {
      const testHtml = `
      <div ngb-accordion>
        <div ngb-accordion-item>
          <h2 ngb-accordion-header><button ngb-accordion-button>Toggle</button></h2>
          <div ngb-accordion-collapse> <div ngb-accordion-body></div></div>
        </div>
        <div ngb-accordion-item collapsed="false">
          <h2 ngb-accordion-header><button ngb-accordion-button>Toggle</button></h2>
          <div ngb-accordion-collapse> <div ngb-accordion-body></div></div>
        </div>
      </div>`;

      const { accordionDirective, nativeElement, fixture } = createTestImperativeAccordion(testHtml);

      expectOpenPanels(nativeElement, [false, true]);

      accordionDirective.collapseAll();
      fixture.detectChanges();
      expectOpenPanels(nativeElement, [false, false]);
    });
  });
});

describe("on push change detection strategy", () => {
  it("Update the other panels accordingly", () => {
    const fixture = TestBed.createComponent(TestOnPushComponent);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll<HTMLElement>(".accordion-header > .accordion-button");
    expectOpenPanels(fixture.nativeElement, [true, false, false]);

    buttons[1]!.click();
    fixture.detectChanges();
    expectOpenPanels(fixture.nativeElement, [false, true, false]);

    buttons[2]!.click();
    fixture.detectChanges();
    expectOpenPanels(fixture.nativeElement, [false, false, true]);

    buttons[0]!.click();
    fixture.detectChanges();
    expectOpenPanels(fixture.nativeElement, [true, false, false]);
  });
});

it(`should allow querying from the body template`, () => {
  let cmp = TestBed.createComponent(QueryTestComponent);
  cmp.detectChanges();
  expect(cmp.componentInstance.bar).toBeDefined();
  expect(cmp.componentInstance.bar.nativeElement.textContent).toBe("Bar");
});

describe("Custom config", () => {
  let config: NgbAccordionConfig;

  beforeEach(
    inject([NgbAccordionConfig], (c: NgbAccordionConfig) => {
      config = c;
      config.closeOthers = true;
    }),
  );

  it("should initialize inputs with provided config", () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const directive = getAccordionDirective(fixture.nativeElement);

    expect(directive.closeOthers).toBe(config.closeOthers);
  });
});

it("should initialize inputs with provided config", () => {
  let config = TestBed.inject(NgbAccordionConfig);
  config.closeOthers = true;
  config.destroyOnHide = false;

  const fixture = TestBed.createComponent(TestComponent);
  fixture.detectChanges();

  const directive = getAccordionDirective(fixture.nativeElement);
  expect(directive.closeOthers).toBe(config.closeOthers);
  expect(directive.destroyOnHide).toBe(config.destroyOnHide);
});

if (isBrowserVisible("ngb-accordion-directive animations")) {
  describe("ngb-accordion-directive animations", () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [{ provide: NgbConfig, useClass: NgbConfigAnimation }],
      });
    });

    it(`should run collapsing transition (force-reduced-motion = false)`, () =>
      new Promise<void>((done) => {
        const fixture = TestBed.createComponent(TestAnimationComponent);
        fixture.componentInstance.reduceMotion = false;
        fixture.detectChanges();
        const el = fixture.nativeElement;
        const id = getItemsIds(el)[0];

        const buttonEl = getPanelsButtons(el)[0]!;
        const collapseEl = getCollapses(el)[0]!;
        const onShownSpy = spyOn(fixture.componentInstance, "onShown");
        const onHiddenSpy = spyOn(fixture.componentInstance, "onHidden");
        const onCollapseShownSpy = spyOn(fixture.componentInstance, "onCollapseShown");
        const onCollapseHiddenSpy = spyOn(fixture.componentInstance, "onCollapseHidden");

        onHiddenSpy.and.callFake((collapseId) => {
          expect(onCollapseHiddenSpy).toHaveBeenCalled();
          expect(collapseId).toBe(id);

          expect(collapseEl).toHaveClass("collapse");
          expect(collapseEl).not.toHaveClass("collapsing");
          expect(collapseEl).not.toHaveClass("show");

          // Expanding
          buttonEl.click();
          fixture.detectChanges();
        });

        onShownSpy.and.callFake((collapseId) => {
          expect(onCollapseShownSpy).toHaveBeenCalled();
          expect(collapseId).toBe(id);

          expect(collapseEl).toHaveClass("collapse");
          expect(collapseEl).not.toHaveClass("collapsing");
          expect(collapseEl).toHaveClass("show");
          done();
        });

        expect(collapseEl).toHaveClass("collapse");
        expect(collapseEl).toHaveClass("show");
        expect(collapseEl).not.toHaveClass("collapsing");

        // Collapsing
        buttonEl.click();
        fixture.detectChanges();

        expect(collapseEl).not.toHaveClass("collapse");
        expect(collapseEl).not.toHaveClass("show");
        expect(collapseEl).toHaveClass("collapsing");
      }));

    it(`should run collapsing transition (force-reduced-motion = true)`, () => {
      const fixture = TestBed.createComponent(TestAnimationComponent);
      fixture.componentInstance.reduceMotion = true;
      fixture.detectChanges();
      const el = fixture.nativeElement;
      const id = getItemsIds(el)[0];

      const buttonEl = getPanelsButtons(el)[0]!;
      const collapseEl = getCollapses(el)[0]!;
      const onShownSpy = spyOn(fixture.componentInstance, "onShown");
      const onHiddenSpy = spyOn(fixture.componentInstance, "onHidden");
      const onCollapseShownSpy = spyOn(fixture.componentInstance, "onCollapseShown");
      const onCollapseHiddenSpy = spyOn(fixture.componentInstance, "onCollapseHidden");

      expect(collapseEl).toHaveClass("collapse");
      expect(collapseEl).toHaveClass("show");
      expect(collapseEl).not.toHaveClass("collapsing");

      // Collapsing
      buttonEl.click();
      fixture.detectChanges();

      expect(onHiddenSpy).toHaveBeenCalledWith(id);
      expect(onCollapseHiddenSpy).toHaveBeenCalled();
      expect(collapseEl).toHaveClass("collapse");
      expect(collapseEl).not.toHaveClass("show");
      expect(collapseEl).not.toHaveClass("collapsing");

      // Expanding
      buttonEl.click();
      fixture.detectChanges();

      expect(onShownSpy).toHaveBeenCalledWith(id);
      expect(onCollapseShownSpy).toHaveBeenCalled();

      expect(collapseEl).toHaveClass("collapse");
      expect(collapseEl).toHaveClass("show");
      expect(collapseEl).not.toHaveClass("collapsing");
    });

    it(`should run revert collapsing transition (force-reduced-motion = false)`, () =>
      new Promise<void>((done) => {
        const fixture = TestBed.createComponent(TestAnimationComponent);
        fixture.componentInstance.reduceMotion = false;
        fixture.detectChanges();

        const el = fixture.nativeElement;
        const id = getItemsIds(el)[0];

        const buttonEl = getPanelsButtons(el)[0]!;
        const collapseEl = getCollapses(el)[0]!;

        const onHiddenSpy = spyOn(fixture.componentInstance, "onHidden");
        const onShownSpy = spyOn(fixture.componentInstance, "onShown");
        const onCollapseShownSpy = spyOn(fixture.componentInstance, "onCollapseShown");
        const onCollapseHiddenSpy = spyOn(fixture.componentInstance, "onCollapseHidden");

        onShownSpy.and.callFake((panelId) => {
          expect(onHiddenSpy).not.toHaveBeenCalled();
          expect(onCollapseHiddenSpy).not.toHaveBeenCalled();
          expect(onCollapseShownSpy).toHaveBeenCalled();
          expect(panelId).toBe(id);

          expect(collapseEl).toHaveClass("collapse");
          expect(collapseEl).toHaveClass("show");
          expect(collapseEl).not.toHaveClass("collapsing");
          done();
        });

        expect(collapseEl).toHaveClass("collapse");
        expect(collapseEl).toHaveClass("show");
        expect(collapseEl).not.toHaveClass("collapsing");

        // Collapsing
        buttonEl.click();
        fixture.detectChanges();

        expect(collapseEl).not.toHaveClass("collapse");
        expect(collapseEl).not.toHaveClass("show");
        expect(collapseEl).toHaveClass("collapsing");

        // Expanding
        buttonEl.click();
        fixture.detectChanges();

        expect(collapseEl).not.toHaveClass("collapse");
        expect(collapseEl).not.toHaveClass("show");
        expect(collapseEl).toHaveClass("collapsing");
      }));
  });
}

@Component({
  selector: "close-others-cmp",
  template: `
    <div ngb-accordion close-others="true">
      <div ng-repeat="_ in $ctrl.state track by $index"
        ngb-accordion-item="$ctrl.keys[$index]" ng-ref="item" ng-ref-read="ngbAccordionItem" collapsed="$ctrl.state[$index]">
        <h2 ngb-accordion-header>
          <button ngb-accordion-button>{{ item.collapsed }}</button>
        </h2>
        <div ngb-accordion-collapse>
          <div ngb-accordion-body></div>
        </div>
      </div>
    </div>
  `,
})
class CloseOthersComponent {
  keys = ["one", "two", "three", "four"];

  @ViewChild(NgbAccordionDirective) accordion!: NgbAccordionDirective;
  @ViewChildren(NgbAccordionItem) items!: QueryList<NgbAccordionItem>;

  constructor(@Inject("state") public state: boolean[]) {}
}

@Component({
  selector: "test-cmp",
  template: `
    <div ngb-accordion close-others="true">
      <div ngb-accordion-item collapsed="false">
        <h2 ngb-accordion-header><button ngb-accordion-button>Toggle</button></h2>
        <div ngb-accordion-collapse><div ngb-accordion-body></div></div>
      </div>
      <div ngb-accordion-item>
        <h2 ngb-accordion-header><button ngb-accordion-button>Toggle</button></h2>
        <div ngb-accordion-collapse><div ngb-accordion-body></div></div>
      </div>
      <div ngb-accordion-item>
        <h2 ngb-accordion-header><button ngb-accordion-button>Toggle</button></h2>
        <div ngb-accordion-collapse><div ngb-accordion-body></div></div>
      </div>
    </div>
  `,
})
class TestOnPushComponent {}

@Component({
  selector: "query-test-cmp",
  template: `
    <div ngb-accordion>
      <div ngb-accordion-item collapsed="false">
        <h2 ngb-accordion-header>
          <button ngb-accordion-button>Foo</button>
        </h2>
        <div ngb-accordion-collapse>
          <div ngb-accordion-body>
            <ng-template>
              <div ng-ref="bar">Bar</div>
            </ng-template>
          </div>
        </div>
      </div>
    </div>
  `,
})
class QueryTestComponent {
  @ViewChild("bar") bar!: ElementRef;
}

@Component({
  selector: "test-animation-cmp",
  template: `
    <div ngb-accordion shown="$ctrl.onShown($event)" hidden="$ctrl.onHidden($event)">
      <div ngb-accordion-item collapsed="false" shown="$ctrl.onCollapseShown()" hidden="$ctrl.onCollapseHidden()">
        <h2 ngb-accordion-header><button ngb-accordion-button>Toggle</button></h2>
        <div ngb-accordion-collapse><div ngb-accordion-body></div></div>
      </div>
      <div ngb-accordion-item>
        <h2 ngb-accordion-header><button ngb-accordion-button>Toggle</button></h2>
        <div ngb-accordion-collapse><div ngb-accordion-body></div></div>
      </div>
    </div>
  `,
})
class TestAnimationComponent {
  // `host: { "[class.ngb-reduce-motion]": "reduceMotion" }` en ng-bootstrap: `host` no está soportado todavía.
  @HostBinding("class.ngb-reduce-motion") reduceMotion = true;
  onShown = (panelId: any) => panelId;
  onHidden = (panelId: any) => panelId;
  onCollapseShown = () => {};
  onCollapseHidden = () => {};
}

@Component({
  selector: "test-cmp",
  template: "<div ngb-accordion></div>",
})
class TestComponent {
  destroyOnHide = true;
  closeOthers = false;
  panels?: { id: string }[];
  items = [
    {
      disabled: false,
      header: "Panel 1",
      body: "foo",
      collapsed: true,
      destroyOnHide: false,
    },
    {
      disabled: false,
      header: "Panel 2",
      body: "bar",
      collapsed: true,
      destroyOnHide: false,
    },
    {
      disabled: false,
      header: "Panel 3",
      body: "baz",
      collapsed: true,
      destroyOnHide: false,
    },
  ];
  showCallback = (_: string) => {};
  shownCallback = (_: string) => {};
  hideCallback = (_: string) => {};
  hiddenCallback = (_: string) => {};
  itemShowCallback = (_?: unknown) => {};
  itemShownCallback = (_?: unknown) => {};
  itemHideCallback = (_?: unknown) => {};
  itemHiddenCallback = (_?: unknown) => {};
}
