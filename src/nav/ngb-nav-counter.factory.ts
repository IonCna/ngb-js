export interface INgbNavCounter {
  get count$(): number;
  increase(): void;
  decrease(): void;
}

class NgbNavCounter implements INgbNavCounter {
  private counter: number;

  constructor() {
    this.counter = 0;
  }

  get count$(): number {
    return this.count$;
  }

  increase(): void {
    this.counter = this.counter + 1;
  }

  decrease(): void {
    this.counter = this.counter - 1;
  }
}

export class NgbNavCounterFactory {
  static get $name() {
    return "ngb.nav.counter.factory";
  }

  static $factory(): INgbNavCounter {
    return new NgbNavCounter();
  }
}
