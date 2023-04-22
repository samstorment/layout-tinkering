<script lang="ts">
    import { onMount } from "svelte";
    import NiceBar from "../header/NiceBar.svelte";
    import Alert from "./Alert.svelte";

    let topSticky: HTMLDivElement;
    let topScrollable: HTMLDivElement;

    onMount(() => {

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
    })
</script>

<div 
    id="top-sticky" 
    class="backdrop-blur sticky top-0 font-semibold w-[100vw] z-[9999]"
    bind:this={topSticky}
>
    <Alert />
    <header id="page-header">
        <div class="border-b border-slate-700 bg-inherit">
            <nav class="max-w-screen-lg mx-auto p-4 text-slate-200">
                <ul class="flex gap-4">
                    <li>
                        <a href="/">Home</a>
                    </li>
                    <li>
                        <a href="#scroll-to-id">Scroll to Id</a>
                    </li>
                    <li>
                        <a href="#scroll-to-different-id">Scroll to different Id</a>
                    </li>
                </ul>
            </nav>
        </div>
    
        <!-- <ChipBar links={docs} client:idle /> -->
            
    </header>
</div>

<div id="top-scrollable" bind:this={topScrollable}>
    <NiceBar />
    <slot />
</div>