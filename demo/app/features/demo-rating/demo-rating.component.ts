import template from "@demo/features/demo-rating/demo-rating.component.html";
import type { IComponentOptions } from "angular";

export class DemoRatingComponent {
  basicRate = 3;
  customMaxRate = 4;
  readonlyRate = 4;
  disabledRate = 2;
  resettableRate = 3;
  hoverRate = 0;
  templateRate = 6;
  decimalRate = 3.14;
  hoverMessage = "Move the pointer over the stars";

  setBasicRate(rate: number): void {
    this.basicRate = rate;
  }

  setCustomMaxRate(rate: number): void {
    this.customMaxRate = rate;
  }

  setResettableRate(rate: number): void {
    this.resettableRate = rate;
  }

  setHoverRate(rate: number): void {
    this.hoverRate = rate;
  }

  setTemplateRate(rate: number): void {
    this.templateRate = rate;
  }

  setDecimalRate(rate: number): void {
    this.decimalRate = rate;
  }

  readonly heartAriaValueText = (current: number, max: number): string => `${current} out of ${max} hearts`;

  showHover(rate: number): void {
    this.hoverMessage = `Previewing ${rate} out of 5`;
  }

  clearHover(): void {
    this.hoverMessage = "Move the pointer over the stars";
  }

  static get $name() {
    return "ngbDemoRating";
  }

  static get $factory(): IComponentOptions {
    return {
      controller: DemoRatingComponent,
      controllerAs: "$",
      template,
    };
  }
}
