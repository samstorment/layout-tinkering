<script lang="ts">
    import { tick } from "svelte";
    import { isOverflownEnd, isOverflownStart, isIntersecting } from "@lib/util";
    import { fade, fly, scale } from "svelte/transition";
    import { onMount } from "svelte";
    import { setContext } from "svelte";
    import { writable } from "svelte/store";

    let container: HTMLDivElement;
    let scroller: HTMLDivElement;
    let list: HTMLUListElement;
    let right: HTMLDivElement;
    let left: HTMLDivElement;
    let rightButton: HTMLButtonElement;
    let leftButton: HTMLButtonElement;

    let resizeTimeout: number;
    let focusTimeout: number;

    const buttonWidth = 80;
    export let padding = 0;
    export let gap = padding;
    
    let overflow = 0;
    let showRight = false;

    let translate = 0;

    let transitionDuration = 150;

    let isSmall = false;
    let isFullyVisible = false;

    $: showLeft = translate != 0;

    $: if (container) {
        overflow = container.scrollWidth - container.offsetWidth;
    }

    $: if (translate > 0) {
        translate = 0;
    }

    // debug info
    $: if (translate <= 0) {
        setTimeout(() => {
            container = container;
        }, 200);
    }
    
    let showButtonBorders = false;
    let id = Math.floor(Math.random() * Date.now());

    onMount(() => {

        const observer = new ResizeObserver(entries => {
            container = container;
            
            clearTimeout(resizeTimeout);

            isFullyVisible = translate === 0 && lastIsVisible();

            if (tooSmall()) {
                handleShrink();
                return;
            } else {
                handleGrow();
            }
            

            resizeTimeout = setTimeout(() => {
                adjust();
            }, 100);
        });

        observer.observe(container);

        Array.from(list.children).forEach((e) => {
            const li = e as HTMLLIElement;

            li.addEventListener('focusin', e => {
                if (isSmall) return;

                container.scrollLeft = 0;

                clearTimeout(focusTimeout);

                focusTimeout = setTimeout(() => {

                    if (isAtEnd(li)) {
                        showRight = li != getLastItem();
                        translate += distanceToEnd(li);
                    } else if (isAtStart(li)) {
                        showRight = true;                        
                        translate += distanceToStart(li);
                    }
                }, 100);
            });
        });

        // for debug info
        container.addEventListener('scroll', _ => container = container);

        return () => {
            observer.disconnect();
            clearTimeout(focusTimeout);
            clearTimeout(resizeTimeout);
        }
    });

    async function handleShrink() {
        // already small so we do nothing
        if (isSmall) return;

        console.log("WE SHRUNK!!!");

        // container.style.scrollBehavior = "auto";

        isSmall = true;
        transitionDuration = 0;
        let scrollLeft = -translate;
        translate = 0;

        // wait for translate to finish before updating scroll left
        await tick();

        container.scrollLeft = scrollLeft;
    }

    async function handleGrow() {
        // already big so we return
        if (!isSmall) return;

        console.log("WE GREW!!!");

        isSmall = false;
        transitionDuration = 0;

        if (container.scrollLeft !== 0) {
            let tx = -container.scrollLeft;
            container.scrollLeft = 0;
            translate = tx;
        }

        // wait for the translation to finish before applying the updated duration
        await tick();

        transitionDuration = 150;
    }

    function lastIsVisible(offset = 0) {
        const l = getLastItem().getBoundingClientRect();
        const c = container.getBoundingClientRect();
        return l.right + offset < c.right;
    }

    async function rightClick() {
        const li = getEndItem();
        if (!li) return;

        // move to end if distance to start is 0
        let tx = distanceToStart(li) || distanceToEnd(li);

        adjust(tx) || (translate += tx);
    }

    async function leftClick() {
        const li = getStartItem();
        if (!li) return;

        // move to start if distance to start is 0
        let tx = distanceToEnd(li) || distanceToStart(li);

        showRight = true;
        translate = translate + tx;
    }

    // moves last item to end if needed and returns true if an adjustment is made
    function adjust(tx = 0) {
        showRight = !lastIsVisible(tx);
        
        if (!showRight) {
            translate += distanceToEnd(getLastItem());
        }
        
        return !showRight;
    }

    function isAtEnd(li: HTMLLIElement) {
        if (!right) return false;
        return isIntersecting(right, li) || isOverflownEnd(container, li);;
    }

    function isAtStart(li: HTMLLIElement) {
        if (!left) return false;
        return isIntersecting(left, li) || isOverflownStart(container, li);
    }

    function distanceToStart(li: HTMLLIElement) {
        const parent = container.getBoundingClientRect();
        const item = li.getBoundingClientRect();
        let amountToMove = parent.left - item.left + padding;
        if (li !== getFirstItem()) amountToMove += buttonWidth;
        return Math.floor(amountToMove);
    }

    function distanceToEnd(li: HTMLLIElement) {
        const parent = container.getBoundingClientRect();
        const item = li.getBoundingClientRect();
        let amountToMove = item.right - parent.right + padding;
        if (li !== getLastItem()) amountToMove += buttonWidth;
        return Math.floor(-amountToMove);
    }

    function getListItems(): Array<HTMLLIElement> {
        if (!list || !list.hasChildNodes) return [];
        return Array.from(list.children) as Array<HTMLLIElement>;
    }

    const tooSmall = () => container.getBoundingClientRect().width <= 350;

    const getFirstItem = () => list.firstElementChild as HTMLLIElement;
    const getLastItem = () => list.lastElementChild as HTMLLIElement;
    const getEndItem = () => getListItems().find(isAtEnd);
    const getStartItem = () => getListItems().reverse().find(isAtStart); 

</script>

{#if container}
    <div class="p-2 border-b border-slate-700">
        <div class="flex gap-2 max-sm:flex-col" transition:fly={{x: -300}}>
            <span>Scroll: {container.scrollWidth}</span>
            <span>Offset: {container.offsetWidth}</span>
            <span>Overflow: {overflow}</span>
            <span>Translate: {translate.toFixed(2)}</span>
            <span>Scroll Left: {container.scrollLeft}</span>
        </div>
        <p class="my-1 text-slate-500 text-sm">
            Scrollable chip bar uses <code class="bg-slate-800 p-1 rounded text-xs">transform: translateX()</code> to simulate scrolling. The bar becomes a normal scrollbar when container is 350px or less. Buttons are hidden if all content can be displayed. Tab can be used to move to focussable elements in the scroll bar.
        </p>
        {#if !isSmall && !isFullyVisible}
            <div class="flex items-center gap-2">
                <label for={`show-borders-${id}`}>Show Button Borders</label>
                <input type="checkbox" id={`show-borders-${id}`} class="aspect-square w-4" bind:checked={showButtonBorders} />
            </div>
        {/if}
    </div>
{/if}

<div class="chip-query-container">
    <div 
        class="chip-container flex-1 overflow-hidden relative" 
        tabindex="-1"
        style={`padding: ${padding}px`}
        bind:this={container}
    >    

        {#if showLeft}
            <div
                transition:fly={{ x: -100 }}
                class="chip-left absolute top-0 left-0 z-50 h-full flex justify-start items-center bg-gradient-to-l from-transparent from-5% via-slate-900/90 via-30%  to-slate-900"
                class:showButtonBorders
                style={`width: ${buttonWidth}px`}
                on:introstart={() => leftButton.disabled = false}
                on:outrostart={() => leftButton.disabled = true}
                bind:this={left}
            >
                <button
                    type="button"
                    class={`p-4 flex justify-center items-center rounded-full border border-slate-700 bg-slate-900/75 w-8 h-8 ml-4`}
                    on:click={leftClick}
                    bind:this={leftButton}
                >
                    &lt;
                </button>
            </div>
        {/if}

        <div id="chip-scroller" bind:this={scroller} 
            class="flex transition transform ease-in-out items-center relative"
            style={`transform: translateX(${translate}px); transition-duration: ${transitionDuration}ms;`}
        >
            <ul 
                class="flex gap-3 w-fit" 
                style={`gap: ${gap}px`}
                bind:this={list}
            >
                <slot />
            </ul>
        </div>

        
        {#if showRight}
            <div
                transition:fly={{ x: 100 }}
                class="chip-right absolute top-0 right-0 z-50 h-full flex justify-end items-center bg-gradient-to-r from-transparent from-5% via-slate-900/70 via-30%  to-slate-900"
                style={`width: ${buttonWidth}px`}
                class:showButtonBorders
                bind:this={right}
                on:introstart={() => rightButton.disabled = false}
                on:outrostart={() => rightButton.disabled = true}
            >
                <button
                    type="button"
                    class={`p-4 flex justify-center items-center rounded-full border border-slate-700 bg-slate-900/90 w-8 h-8 mr-4`}
                    on:click={rightClick}
                    bind:this={rightButton}
                >
                    &gt;
                </button>
            </div>
        {/if}
    </div>
</div>



<style>
    .chip-right.showButtonBorders {
        border-left: 1px solid red;
    }

    .chip-left.showButtonBorders {
        border-right: 1px solid red;
    }

    .chip-query-container {
        container: chips-query / inline-size;
    }

    @container chips-query (max-width: 350px) {
        .chip-container {
            overflow-x: auto;
            scroll-padding-left: 12px;
            scroll-padding-right: 12px;
        }

        .chip-left, .chip-right {
            display: none;
        }

        * > :global(ul > li:last-child) {
            margin-right: 12px;
        }
    }
</style>