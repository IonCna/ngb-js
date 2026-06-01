export function toGregorian(date: NgbDate): Date {
  return new Date(date.year - 543, date.month - 1, date.day);
}

export function fromGregorian(gdate: Date): NgbDate {
  return new NgbDate(gdate.getFullYear() + 543, gdate.getMonth() + 1, gdate.getDate());
}
