const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
        const height = entry.contentRect.height;

        if (!height) return;

        document.documentElement.style.setProperty("--nav-height", `${height}px`);
    }
});

const topElement = document.querySelector("#top");

if (topElement) {
    resizeObserver.observe(topElement);
}