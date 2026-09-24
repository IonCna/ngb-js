import createSpy = jasmine.createSpy;
import { type ComponentFixture, inject, TestBed } from "ngjs-core/testing";
import { createGenericTestComponent, isBrowserVisible } from "../test/common";

import angular from "angular";
import { Component, HostBinding } from "ngjs-core";

import { NgbAlert } from "./ngb-alert.component";
import { NgbAlertModule } from "./ngb-alert.module";
import { NgbAlertConfig } from "./ngb-alert-config.service";

import { NgbConfig } from "../config/ngb-config";
import { NgbConfigAnimation } from "../test/ngb-config-animation";

/**
 * Port de `alert.spec.ts` de ng-bootstrap 16. Diferencias forzadas por AngularJS:
 * - los templates van en sintaxis de AngularJS (`type="'success'"`, `ng-class`, `(closed)` → `closed="$ctrl.…"`);
 * - sin componentes standalone: `NgbAlertModule` se importa en el módulo de test;
 * - sin `DebugElement`: la instancia se toma con `angular.element(…).controller()`.
 */
const createTestComponent = (html: string) =>
  createGenericTestComponent(html, TestComponent) as ComponentFixture<TestComponent>;

function getAlertElement(element: HTMLElement): HTMLDivElement {
  return <HTMLDivElement>element.querySelector(".alert");
}

function getCloseButton(element: HTMLElement): HTMLButtonElement {
  return <HTMLButtonElement>element.querySelector("button");
}

describe("ngb-alert", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [NgbAlertModule] });
  });

  it("should initialize inputs with default values", () => {
    const defaultConfig = TestBed.inject(NgbAlertConfig);
    const alertCmp = TestBed.createComponent(NgbAlert).componentInstance;
    expect(alertCmp.dismissible).toBe(defaultConfig.dismissible);
    expect(alertCmp.type).toBe(defaultConfig.type);
  });

  it("should apply those default values to the template", () => {
    const fixture = createTestComponent("<ngb-alert>Cool!</ngb-alert>");
    const alertEl = getAlertElement(fixture.nativeElement);

    expect(alertEl.getAttribute("role")).toEqual("alert");
    expect(alertEl).toHaveCssClass("alert-warning");
    expect(alertEl).toHaveCssClass("alert-dismissible");
    expect(alertEl).toHaveCssClass("show");
    expect(alertEl).not.toHaveCssClass("fade");
  });

  it("should allow specifying alert type", () => {
    const fixture = createTestComponent(
      `<ngb-alert type="'success'" ng-class="['class1', {class3: true}]" class="class2">Cool!</ngb-alert>`,
    );
    const alertEl = getAlertElement(fixture.nativeElement);

    expect(alertEl.getAttribute("role")).toEqual("alert");
    expect(alertEl).toHaveCssClass("alert");
    expect(alertEl).toHaveCssClass("class1");
    expect(alertEl).toHaveCssClass("class2");
    expect(alertEl).toHaveCssClass("class3");
    expect(alertEl).toHaveCssClass("alert-success");
  });

  it("should allow changing alert type", () => {
    const fixture = createTestComponent(
      `<ngb-alert type="$ctrl.type" ng-class="['class1', {class3: true}]" class="class2">Cool!</ngb-alert>`,
    );
    const alertEl = getAlertElement(fixture.nativeElement);

    expect(alertEl).toHaveCssClass("alert-success");
    expect(alertEl).not.toHaveCssClass("alert-warning");

    fixture.componentInstance.type = "warning";
    fixture.detectChanges();
    expect(alertEl).not.toHaveCssClass("alert-success");
    expect(alertEl).toHaveCssClass("alert");
    expect(alertEl).toHaveCssClass("class1");
    expect(alertEl).toHaveCssClass("class2");
    expect(alertEl).toHaveCssClass("class3");
    expect(alertEl).toHaveCssClass("alert-warning");
  });

  it("should allow adding custom CSS classes", () => {
    const fixture = createTestComponent(`<ngb-alert type="'success'" class="myClass">Cool!</ngb-alert>`);
    const alertEl = getAlertElement(fixture.nativeElement);

    expect(alertEl).toHaveCssClass("alert");
    expect(alertEl).toHaveCssClass("alert-success");
    expect(alertEl).toHaveCssClass("myClass");
  });

  it("should render close button when dismissible", () => {
    const fixture = createTestComponent(`<ngb-alert dismissible="true">Watch out!</ngb-alert>`);
    const alertEl = getAlertElement(fixture.nativeElement);
    const buttonEl = getCloseButton(alertEl);

    expect(alertEl).toHaveCssClass("alert-dismissible");
    expect(buttonEl).toBeTruthy();
    expect(buttonEl.getAttribute("class")).toContain("btn-close");
    expect(buttonEl.getAttribute("aria-label")).toBe("Close");
  });

  it("should not render the close button if it is not dismissible", () => {
    const fixture = createTestComponent(`<ngb-alert dismissible="false">Don't close!</ngb-alert>`);
    const alertEl = getAlertElement(fixture.nativeElement);

    expect(alertEl).not.toHaveCssClass("alert-dismissible");
    expect(getCloseButton(alertEl)).toBeFalsy();
  });

  it("should fire an event after closing a dismissible alert", () => {
    const fixture = createTestComponent(
      `<ngb-alert dismissible="true" closed="$ctrl.closed = true">Watch out!</ngb-alert>`,
    );
    const alertEl = getAlertElement(fixture.nativeElement);
    const buttonEl = getCloseButton(alertEl);

    expect(fixture.componentInstance.closed).toBe(false);
    buttonEl.click();
    expect(alertEl).not.toHaveCssClass("show");
    expect(alertEl).not.toHaveCssClass("fade");
    expect(fixture.componentInstance.closed).toBe(true);
  });

  it("should fire an event after closing a dismissible alert imperatively", () => {
    const fixture = createTestComponent(
      `<ngb-alert dismissible="true" closed="$ctrl.closed = true">Watch out!</ngb-alert>`,
    );
    const alertEl = getAlertElement(fixture.nativeElement);
    const alert = angular.element(alertEl).controller("ngbAlert") as NgbAlert;

    const closedSpy = createSpy();
    expect(fixture.componentInstance.closed).toBe(false);
    alert.close().subscribe(closedSpy);
    fixture.detectChanges();

    expect(fixture.componentInstance.closed).toBe(true);
    expect(closedSpy).toHaveBeenCalledTimes(1);
    expect(alertEl).not.toHaveCssClass("show");
    expect(alertEl).not.toHaveCssClass("fade");
  });

  it("should project the content given into the component", () => {
    const fixture = createTestComponent("<ngb-alert>Cool!</ngb-alert>");
    const alertEl = getAlertElement(fixture.nativeElement);

    expect(alertEl.textContent).toContain("Cool!");
  });

  it("should project content before the closing button for a11y/screen readers", () => {
    const fixture = createTestComponent(`<ngb-alert dismissible="true"><span>Cool!</span></ngb-alert>`);
    const alertEl = getAlertElement(fixture.nativeElement);

    const childElements = Array.from(alertEl.children).map((node) => node.tagName.toLowerCase());
    expect(childElements).toEqual(["span", "button"]);
  });

  describe("Custom config", () => {
    let config: NgbAlertConfig;

    beforeEach(
      inject([NgbAlertConfig], (c: NgbAlertConfig) => {
        config = c;
        config.dismissible = false;
        config.type = "success";
      }),
    );

    it("should initialize inputs with provided config", () => {
      const fixture = TestBed.createComponent(NgbAlert);
      fixture.detectChanges();

      const alert = fixture.componentInstance;
      expect(alert.dismissible).toBe(config.dismissible);
      expect(alert.type).toBe(config.type);
    });
  });

  it("should initialize inputs with provided config as provider", () => {
    let config = TestBed.inject(NgbAlertConfig);
    config.dismissible = false;
    config.type = "success";

    const alert = TestBed.createComponent(NgbAlert).componentInstance;
    expect(alert.dismissible).toBe(config.dismissible);
    expect(alert.type).toBe(config.type);
  });
});

if (isBrowserVisible("ngb-alert animations")) {
  describe("ngb-alert animations", () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [NgbAlertModule],
        providers: [{ provide: NgbConfig, useClass: NgbConfigAnimation }],
      });
    });

    [true, false].forEach((reduceMotion) => {
      it(`should run fade transition when closing alert (force-reduced-motion = ${reduceMotion})`, () => {
        const fixture = TestBed.createComponent(TestAnimationComponent);
        fixture.componentInstance.reduceMotion = reduceMotion;
        fixture.detectChanges();

        const alertEl = getAlertElement(fixture.nativeElement);
        const buttonEl = fixture.nativeElement.querySelector("button")!;

        spyOn(fixture.componentInstance, "onClose").and.callFake(() => {
          expect(window.getComputedStyle(alertEl).opacity).toBe("0");
          expect(alertEl).not.toHaveCssClass("show");
          expect(alertEl).toHaveCssClass("fade");
        });

        expect(window.getComputedStyle(alertEl).opacity).toBe("1");
        expect(alertEl).toHaveCssClass("show");
        expect(alertEl).toHaveCssClass("fade");
        buttonEl.click();
      });
    });
  });
}

/** En ng-bootstrap está dentro del `describe`: el compilador solo lee clases de nivel de módulo. */
@Component({
  selector: "test-animation-cmp",
  template: `<ngb-alert type="'success'" close="$ctrl.onClose()">Cool!</ngb-alert>`,
})
class TestAnimationComponent {
  // `host: { "[class.ngb-reduce-motion]": "reduceMotion" }` en ng-bootstrap: `host` no está soportado todavía.
  @HostBinding("class.ngb-reduce-motion") reduceMotion = true;
  onClose = () => {};
}

@Component({ selector: "test-cmp", template: "" })
class TestComponent {
  name = "World";
  closed = false;
  type = "success";
}
