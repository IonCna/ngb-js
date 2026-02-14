export function percentFilter() {
    return (value: number) => `${value * 100}%`
}

percentFilter.$name = "ngbPercent"