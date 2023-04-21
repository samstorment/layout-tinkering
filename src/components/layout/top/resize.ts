const topSticky = document.querySelector("#top-sticky") as HTMLDivElement;
const topScrollable = document.querySelector("#top-scrollable") as HTMLDivElement;

const topResizeObserver = new ResizeObserver((entries) => {

    for (const entry of entries) {
        const stickyHeight = topSticky.getBoundingClientRect().height;
        const scrollableHeight = topScrollable.getBoundingClientRect().height;        
        document.documentElement.style.setProperty("--top-height", `${stickyHeight + scrollableHeight}px`);
    
        topIntersectionObserver.unobserve(topSticky);
        topIntersectionObserver = createTopIntersectionObserver();
    }

});

function createTopIntersectionObserver() {

    let threshold: number[] = [];

    // create a threshold for every percent 0.01, 0.02, 0.03...1
    for (let i = 1; i <= 100; i++) {
        threshold.push(i / 100);
    }

    return new IntersectionObserver(entries => {
        for (const entry of entries) {

            // console.log("wow!");

            const stickyHeight = topSticky.getBoundingClientRect().height;
            const h = entry.intersectionRect.height;
            
            document.documentElement.style.setProperty("--top-height", `${stickyHeight + h}px`);
        }
    }, {
        root: null,
        rootMargin: `-${topSticky.getBoundingClientRect().height}px`,
        threshold: threshold
    });
}

let topIntersectionObserver = createTopIntersectionObserver();

if (topSticky) {
    topResizeObserver.observe(topSticky);
    topIntersectionObserver.observe(topScrollable);
}