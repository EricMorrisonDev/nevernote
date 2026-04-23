
export function truncateTitle(title: string): string {
    if(!title || title.length === 0) return ''
    if(title.length <= 12) return title

    const truncatedTitle = title.slice(0, 12)
    return truncatedTitle + '...'
    
}