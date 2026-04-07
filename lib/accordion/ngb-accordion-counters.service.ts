export class NgbAccordionCounterService {
    private accordionItemCounter = 0

    public increase() {
        return ++this.accordionItemCounter
    }

    public decrease() {
        return --this.accordionItemCounter
    }

    static get $name() {
        return "ngb.accordion.counter.service"
    }
}
