type StackEntry = {
    id: number
    opener: HTMLElement | null
    modalEl?: HTMLElement
}

export class NgbModalStackFactory {
    private entries: StackEntry[] = []
    private seq = 0
    private originalBodyOverflow = ""
    private originalBodyPaddingRight = ""

    public open(opener: Element | null) {
        if (this.entries.length === 0) {
            this.lockBodyScroll()
        }

        const id = ++this.seq
        this.entries.push({
            id,
            opener: opener instanceof HTMLElement ? opener : null
        })

        return { id, level: this.entries.length }
    }

    public registerModalElement(id: number | undefined, modalEl: HTMLElement) {
        if (!id) return
        const entry = this.entries.find(item => item.id === id)
        if (!entry) return
        entry.modalEl = modalEl
    }

    public isTop(id: number | undefined) {
        if (!id || this.entries.length === 0) return false
        return this.entries[this.entries.length - 1].id === id
    }

    public close(id: number | undefined) {
        if (!id) return
        const idx = this.entries.findIndex(item => item.id === id)
        if (idx < 0) return

        const wasTop = idx === this.entries.length - 1
        const [entry] = this.entries.splice(idx, 1)

        if (this.entries.length === 0) {
            this.restoreBodyStyles()
            if (entry?.opener && document.contains(entry.opener)) {
                entry.opener.focus()
            }
            return
        }

        if (!wasTop) return

        const previous = this.entries[this.entries.length - 1]
        if (previous?.modalEl && document.contains(previous.modalEl)) {
            previous.modalEl.focus()
        }
    }

    private getScrollbarWidth() {
        return Math.max(0, window.innerWidth - document.documentElement.clientWidth)
    }

    private lockBodyScroll() {
        const body = document.body
        this.originalBodyOverflow = body.style.overflow
        this.originalBodyPaddingRight = body.style.paddingRight

        body.classList.add("modal-open")
        body.style.overflow = "hidden"

        const width = this.getScrollbarWidth()
        if (width > 0) {
            body.style.paddingRight = `${width}px`
        }
    }

    private restoreBodyStyles() {
        const body = document.body
        body.classList.remove("modal-open")
        body.style.overflow = this.originalBodyOverflow
        body.style.paddingRight = this.originalBodyPaddingRight
    }

    static get $name() {
        return "ngbModalStackFactory"
    }
}

