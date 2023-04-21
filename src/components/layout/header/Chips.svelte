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
    $: showLeft = translate != 0;

    $: if (container) {
        overflow = container.scrollWidth - container.offsetWidth;
    }

    $: if (translate > 0) {
        translate = 0;
    }
    
    onMount(() => {
        
        const observer = new ResizeObserver(entries => {
            container = container;

            clearTimeout(resizeTimeout);

            resizeTimeout = setTimeout(() => {
                adjust();
            }, 100);
        });

        observer.observe(container);

        Array.from(list.children).forEach((e) => {
            const li = e as HTMLLIElement;

            li.addEventListener('focusin', e => {
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

        return () => {
            observer.disconnect();
            clearTimeout(focusTimeout);
            clearTimeout(resizeTimeout);
        }
    });

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
            translate = translate + distanceToEnd(getLastItem());
            return true;
        }
        
        return false;
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

    const getFirstItem = () => list.firstElementChild as HTMLLIElement;
    const getLastItem = () => list.lastElementChild as HTMLLIElement;
    const getEndItem = () => getListItems().find(isAtEnd);
    const getStartItem = () => getListItems().reverse().find(isAtStart); 

</script>

<!-- {#if container}
    <div class="border-b border-slate-700 p-2 flex gap-2" transition:fly={{x: -300}}>
        <span>Scroll: {container.scrollWidth}</span>
        <span>Offset: {container.offsetWidth}</span>
        <span>Overflow: {overflow}</span>
        <span>Translate: {translate.toFixed(2)}</span>
        <span>Last Size: {lastSize}</span>
    </div>
{/if} -->



<div 
    id="chip-container" 
    class="flex-1 overflow-hidden relative" 
    tabindex="-1"
    style={`padding: ${padding}px`}
    bind:this={container}
>    

    {#if showLeft}
        <div
            transition:fly={{ x: -100 }}
            class="chip-left absolute top-0 left-0 z-50 h-full flex justify-start items-center bg-gradient-to-l from-transparent from-5% via-slate-900/90 via-30%  to-slate-900"
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
        style={`transform: translateX(${translate}px);`}
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