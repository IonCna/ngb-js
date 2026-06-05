export class NgbNavCounterService {
  private count = 0;

  public increase() {
    return this.count++;
  }

  public decrease() {
    return this.count--;
  }

  static get $name() {
    return "ngb.nav.counter.service";
  }
}
