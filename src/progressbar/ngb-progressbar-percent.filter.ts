import { Pipe, type PipeTransform } from "ngjs-core";

@Pipe({ name: "ngbProgressbarPercent" })
export class NgbProgressbarPercentFilter implements PipeTransform<number | null | undefined, string> {
  transform(value?: number | null): string {
    const number = Number(value);
    if (!Number.isFinite(number)) return "0%";

    const percent = Math.round(number * 10000) / 100;
    return `${percent}%`;
  }
}
