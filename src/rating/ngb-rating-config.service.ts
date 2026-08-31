export class NgbRatingConfig {
  max = 10;
  readonly = false;
  resettable = false;
  tabindex: number | string = 0;

  static get $name() {
    return "ngb.rating.config.service";
  }
}
