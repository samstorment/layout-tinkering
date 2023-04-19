export function isInViewport(element: HTMLElement) {

    const rect = element.getBoundingClientRect();
    
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

export function isIntersectingEnd(parent: HTMLElement, child: HTMLElement) {
    const c = child.getBoundingClientRect();
    const p = parent.getBoundingClientRect();
    return c.left < p.right && c.right > p.right;
}

export function isOverflownEnd(parent: HTMLElement, child: HTMLElement) {
    const c = child.getBoundingClientRect();
    const p = parent.getBoundingClientRect();
    return c.left > p.right;
}

export function isIntersectingStart(parent: HTMLElement, child: HTMLElement) {
    const c = child.getBoundingClientRect();
    const p = parent.getBoundingClientRect();
    return c.left < p.left && c.right > p.left;
}

export function isOverflownStart(parent: HTMLElement, child: HTMLElement) {
    const c = child.getBoundingClientRect();
    const p = parent.getBoundingClientRect();
    return c.right < p.left;
}

export function isIntersecting(element1: HTMLElement, element2: HTMLElement) {
    const a = element1.getBoundingClientRect();
    const b = element2.getBoundingClientRect();
    return a.bottom > b.top && a.right > b.left && a.top < b.bottom && a.left < b.right
}