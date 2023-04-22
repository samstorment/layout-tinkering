const topSticky = document.querySelector("#top-sticky") as HTMLDivElement;
const topScrollable = document.querySelector("#top-scrollable") as HTMLDivElement;

let topIntersectionObserver: IntersectionObserver;

let resizeTimeout = 0;
let intersectionheight = 0;

const topResizeObserver = new ResizeObserver((entries) => {


    for (const entry of entries) {
        const stickyHeight = topSticky.getBoundingClientRect().height;
        const scrollableHeight = topScrollable.getBoundingClientRect().height;        
        document.documentElement.style.setProperty("--top-height", `${stickyHeight + intersectionheight}px`);
        document.documentElement.style.setProperty("--sticky-top-height", `${stickyHeight}px`);
        
        clearTimeout(resizeTimeout);

        resizeTimeout = setTimeout(() => {
            if (topIntersectionObserver) {
                console.log("Disconnected Top Intersection Observer");
                topIntersectionObserver.disconnect();
            }
            topIntersectionObserver = createTopIntersectionObserver();
            topIntersectionObserver.observe(topScrollable);
        }, 1000);
    }

});

function createTopIntersectionObserver() {

    let threshold: number[] = [];

    let thresholdCount = 100;

    // create a threshold for every percent 0.01, 0.02, 0.03...1
    for (let i = 1; i <= thresholdCount; i++) {
        threshold.push(i / thresholdCount);
    }

    console.log(threshold);

    const rootMargin = `-${topSticky.getBoundingClientRect().height}px`;

    console.log("Intersection observer created with rootMargin:", rootMargin);

    return new IntersectionObserver(entries => {
        for (const entry of entries) {
            const stickyHeight = topSticky.getBoundingClientRect().height;
            intersectionheight = entry.intersectionRect.height;
            
            console.log("Intersection update!", stickyHeight, intersectionheight, entry.intersectionRatio);

            document.documentElement.style.setProperty("--top-height", `${stickyHeight + intersectionheight}px`);
        }
    }, {
        rootMargin,
        threshold
    });
}

if (topSticky) {
    topResizeObserver.observe(topSticky);
}