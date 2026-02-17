export function percentFilter() {
    return (value?: number | null) => {
        const numericValue = Number(value)
        if (!Number.isFinite(numericValue)) return "0%"

        const percent = Math.round(numericValue * 10000) / 100
        return `${percent}%`
    }
}

percentFilter.$name = "ngbPercent"
