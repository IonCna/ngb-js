import {describe, expect, it} from "vitest";
import {NgbTime} from "@ngb/timepicker/ngb-time";

describe("NgbTime", () => {
  it("constructs time objects", () => {
    expect(new NgbTime(undefined, undefined).toString()).toBe("0:0:0");
    expect(new NgbTime(12, 31, 45).toString()).toBe("12:31:45");
  });

  it("changes and wraps hours", () => {
    const time = new NgbTime(23, 30);

    time.changeHour(1);
    expect(time.toString()).toBe("0:30:0");
    time.changeHour(-5);
    expect(time.toString()).toBe("19:30:0");
    time.changeHour(26);
    expect(time.toString()).toBe("21:30:0");
  });

  it("starts undefined hours at zero", () => {
    const time = new NgbTime(undefined, 30);
    time.changeHour(1);
    expect(time.toString()).toBe("1:30:0");
  });

  it("changes and wraps minutes across hour boundaries", () => {
    const time = new NgbTime(10, 30);

    time.changeMinute(41);
    expect(time.toString()).toBe("11:11:0");
    time.changeMinute(121);
    expect(time.toString()).toBe("13:12:0");
    time.changeMinute(-122);
    expect(time.toString()).toBe("11:10:0");
  });

  it("wraps minutes around midnight", () => {
    const time = new NgbTime(0, 30);

    time.changeMinute(-40);
    expect(time.toString()).toBe("23:50:0");
    time.changeMinute(50);
    expect(time.toString()).toBe("0:40:0");
    time.changeMinute(24 * 60);
    expect(time.toString()).toBe("0:40:0");
  });

  it("starts undefined minutes at zero", () => {
    const time = new NgbTime(1, undefined);
    time.changeMinute(0);
    expect(time.toString()).toBe("1:0:0");
  });

  it("changes and wraps seconds across minute and hour boundaries", () => {
    const time = new NgbTime(10, 30, 30);

    time.changeSecond(60);
    expect(time.toString()).toBe("10:31:30");
    time.changeSecond(60 * 60);
    expect(time.toString()).toBe("11:31:30");
    time.changeSecond(-60 * 60);
    expect(time.toString()).toBe("10:31:30");
  });

  it("wraps seconds around midnight", () => {
    const time = new NgbTime(0, 0, 30);

    time.changeSecond(-40);
    expect(time.toString()).toBe("23:59:50");
    time.changeSecond(110);
    expect(time.toString()).toBe("0:1:40");
  });

  it("starts undefined seconds at zero", () => {
    const time = new NgbTime(1, 20, undefined);
    time.changeSecond(30);
    expect(time.toString()).toBe("1:20:30");
  });

  it("updates individual units with wrapping", () => {
    const time = new NgbTime(0, 30, 30);

    time.updateHour(25);
    expect(time.toString()).toBe("1:30:30");
    time.updateMinute(90);
    expect(time.toString()).toBe("2:30:30");
    time.updateSecond(70);
    expect(time.toString()).toBe("2:31:10");
  });

  it("reports valid and invalid values", () => {
    expect(new NgbTime(11, 0, 30).isValid()).toBe(true);
    expect(new NgbTime(undefined, 0, 30).isValid()).toBe(false);
    expect(new NgbTime(11, undefined, 30).isValid()).toBe(false);
    expect(new NgbTime(11, 0, undefined).isValid()).toBe(false);
    expect(new NgbTime(11, 0, undefined).isValid(false)).toBe(true);
  });
});
