import { toInteger, isNumber } from "@ngb/utils";

export class NgbTime {
  hour: number;
  minute: number;
  second: number;

  constructor(hour?: number, minute?: number, second?: number) {
    this.hour = toInteger(hour);
    this.minute = toInteger(minute);
    this.second = toInteger(second);
  }

  public changeHour(step = 1) {
    this.updateHour((isNaN(this.hour) ? 0 : this.hour) + step);
  }

  public updateHour(hour: number) {
    if (isNumber(hour)) {
      this.hour = (hour < 0 ? 24 + hour : hour) % 24;
      return;
    }

    this.hour = NaN;
  }

  public changeMinute(step = 1) {
    this.updateMinute((isNaN(this.minute) ? 0 : this.minute) + step);
  }

  public updateMinute(minute: number) {
    if (isNumber(minute)) {
      this.minute = minute % 60 < 0 ? 60 + (minute % 60) : minute % 60;
      this.changeHour(Math.floor(minute / 60));
      return;
    }

    this.minute = NaN;
  }

  public changeSecond(step = 1) {
    this.updateSecond((isNaN(this.second) ? 0 : this.second) + step);
  }

  public updateSecond(second: number) {
    if (isNumber(second)) {
      this.second = second < 0 ? 60 + (second % 60) : second % 60;
      this.changeMinute(Math.floor(second / 60));
      return;
    }

    this.second = NaN;
  }

  public isValid(checkSecs = true) {
    return isNumber(this.hour) && isNumber(this.minute) && (checkSecs ? isNumber(this.second) : true);
  }

  public toString() {
    return `${this.hour || 0}:${this.minute || 0}:${this.second || 0}`;
  }
}
