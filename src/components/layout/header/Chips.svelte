<script lang="ts">
    import { tick } from "svelte";
    import { isOverflownEnd, isOverflownStart, isIntersectingEnd, isIntersectingStart, isIntersecting, defineService } from "@lib/util";
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
    let lastSize = 0;

    const buttonWidth = 80;
    const padding = 16;
    
    let overflow = 0;
    let showRight = true;

    let translate = 0;
    $: showLeft = translate != 0;

    $: if (container) {
        overflow = container.scrollWidth - container.offsetWidth;
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

        console.log(list);

        Array.from(list.children).forEach((e) => {
            const li = e as HTMLLIElement;

            li.addEventListener('focusin', e => {
                container.scrollLeft = 0;

                if (isAtEnd(li)) {
                    showRight = li != getLastItem();
                    translate += distanceToEnd(li);
                } else if (isAtStart(li)) {
                    showRight = true;
                    translate += distanceToStart(li);
                    console.log(translate);
                }
            });
        })
    });

    function lastIsVisible(offset = 0) {
        const l = getLastItem().getBoundingClientRect();
        const c = container.getBoundingClientRect();
        return l.right + offset < c.right;
    }

    async function rightClick() {
        const li = getEndItem();
        if (!li) return;
        let tx = distanceToStart(li);
        adjust(tx) || (translate += tx);
    }

    async function leftClick() {
        const li = getStartItem();
        if (!li) return;
        let tx = distanceToEnd(li);
        showRight = true;
        translate = Math.min(0, translate + tx);
    }

    function adjust(tx = 0) {

        showRight = !lastIsVisible(tx);
        
        if (!showRight) {
            translate = Math.min(0, translate + distanceToEnd(getLastItem()));
            return true;
        }

        if (translate === 0) return false;

        return false;
    }

    function isAtEnd(li: HTMLElement) {
        if (!right) return false;
        return isIntersecting(right, li) || isOverflownEnd(container, li);;
    }

    function isAtStart(li: HTMLElement) {
        if (!left) return false;
        return isIntersecting(left, li) || isOverflownStart(container, li);
    }

    function findFirstItem(func: (li: HTMLElement) => Boolean) {
        const li = Array.from(list.children).find((li) => {
            return (li instanceof HTMLLIElement) && func(li);
        });

        if (li) {
            return li as HTMLLIElement;
        }
    }

    function findLastItem(func: (li: HTMLElement) => Boolean) {
        const li = Array.from(list.children).reverse().find((li) => {
            return (li instanceof HTMLLIElement) && func(li);
        });

        if (li) {
            return li as HTMLLIElement;
        }
    }

    function distanceToStart(li: HTMLLIElement) {
        const parent = container.getBoundingClientRect();
        const item = li.getBoundingClientRect();
        let amountToMove = parent.left - item.left + padding;
        if (li !== getFirstItem()) amountToMove += buttonWidth;
        console.log(amountToMove);
        return Math.floor(amountToMove);
    }

    function distanceToEnd(li: HTMLLIElement) {
        const parent = container.getBoundingClientRect();
        const item = li.getBoundingClientRect();
        let amountToMove = item.right - parent.right + padding;
        if (li !== getLastItem()) amountToMove += buttonWidth;
        return Math.floor(-amountToMove);
    }

    const getFirstItem = () => list.firstElementChild as HTMLLIElement;
    const getLastItem = () => list.lastElementChild as HTMLLIElement;
    const getEndItem = () => findFirstItem(isAtEnd); 
    const getStartItem = () => findLastItem(isAtStart); 
    

</script>

{#if container}
    <div class="border-b border-slate-700 p-2 flex gap-2" transition:fly={{x: -300}}>
        <span>Scroll: {container.scrollWidth}</span>
        <span>Offset: {container.offsetWidth}</span>
        <span>Overflow: {overflow}</span>
        <span>Translate: {translate.toFixed(2)}</span>
        <span>Last Size: {lastSize}</span>
    </div>
{/if}

<nav
    class="border-b border-slate-700 max-[200px]:hidden font-normal flex items-stretch"
>

    <!-- <div 
        class="border-r border-slate-700 px-4 flex items-center"    
    >
        Hey how are you????
    </div> -->

    <div 
        id="chip-container" 
        class="flex-1 overflow-hidden p-4 relative" 
        tabindex="-1" 
        bind:this={container}
    >    

        {#if showLeft}
            <div
                transition:fly={{ x: -100, duration: 1000}}
                class={`chip-left absolute top-0 left-0 z-50 h-full flex justify-start items-center bg-gradient-to-l from-transparent from-5% via-slate-900/90 via-30%  to-slate-900 border-r border-red-700`}
                style={`width: ${buttonWidth}px`}
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
            class="transition transform ease-in-out flex items-center relative"
            style={`transform: translateX(${translate}px);`}
        >
            <ul class="flex gap-4 w-fit" bind:this={list}>
                <slot />
            </ul>
        </div>

       
        {#if showRight}
            <div
                in:fly={{ x: 100 }}
                out:fly={{ x: 100 }} 
                class={`chip-right absolute top-0 right-0 z-50 h-full flex justify-end items-center bg-gradient-to-r from-transparent from-5% via-slate-900/70 via-30%  to-slate-900 border-l border-red-700`
                }
                style={`width: ${buttonWidth}px`}
                bind:this={right}
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

    <div class="flex items-center border-l border-slate-700 px-4">
        EAT UP SPACE
    </div>

</nav>