export class NgbProgressbarPercentFilter {
  static get $name() {
    return "ngbProgressbarPercent";
  }

  static $transform() {
    return (value?: number | null) => {
      const number = Number(value);
      if (!Number.isFinite(number)) return "0%";

      const percent = Math.round(number * 10000) / 100;
      return `${percent}%`;
    };
  }
}
