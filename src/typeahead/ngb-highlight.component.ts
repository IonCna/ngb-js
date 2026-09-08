import template from "@ngb/typeahead/ngb-highlight.component.html";
import { regExpEscape, removeAccents, toString } from "@ngb/utils";
import { Component, Input, type OnChanges, type SimpleChanges } from "ngjs-core";

@Component({
  selector: "ngb-highlight",
  template,
})
export class NgbHighlight implements OnChanges {
  parts!: string[];

  @Input() highlightClass = "ngb-highlight";
  @Input({ required: true }) result?: string | null;
  @Input({ required: true }) term!: string | readonly string[];
  @Input() accentSensitive = true;

  ngOnChanges(_changes: SimpleChanges): void {
    if (!this.accentSensitive && !String.prototype.normalize) {
      console.warn(
        "The `accentSensitive` input in `ngb-highlight` cannot be set to `false` in a browser " +
          "that does not implement the `String.normalize` function. " +
          "You will have to include a polyfill in your application to use this feature in the current browser.",
      );
      this.accentSensitive = true;
    }

    const result = toString(this.result);
    const terms = Array.isArray(this.term) ? this.term : [this.term];
    const prepareTerm = (term: string) => (this.accentSensitive ? term : removeAccents(term));
    const escapedTerms = terms.map((term) => regExpEscape(prepareTerm(toString(term)))).filter((term) => term);
    const toSplit = this.accentSensitive ? result : removeAccents(result);
    const parts = escapedTerms.length ? toSplit.split(new RegExp(`(${escapedTerms.join("|")})`, "gmi")) : [result];

    if (this.accentSensitive) {
      this.parts = parts;
    } else {
      let offset = 0;
      this.parts = parts.map((part) => result.substring(offset, (offset += part.length)));
    }
  }
}
