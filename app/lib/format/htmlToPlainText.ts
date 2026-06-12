export function htmlToPlainText(html: string): string {
    const el = document.createElement("div")
    el.innerHTML = html
    return (el.textContent || "")
        .replace(/\s+/g, " ")
        .trim()
}
