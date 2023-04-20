<script lang="ts">
    import { tick } from "svelte";
    import { isOverflownEnd, isOverflownStart, isIntersectingEnd, isIntersectingStart, isIntersecting } from "@lib/util";
    import { fade, fly, scale } from "svelte/transition";
    import { onMount } from "svelte";

    export let links: Array<{ text: string, href: string }>;

    let container: HTMLDivElement;
    let scroller: HTMLDivElement;
    let list: HTMLUListElement;
    let right: HTMLDivElement;
    let left: HTMLDivElement;
    let rightButton: HTMLButtonElement;

    let resizeTimeout: number;
    let focusTimeout: number;
    let lastSize = 0;

    const buttonWidth = 80;
    const padding = 16;
    
    let overflow = 0;
    let showRight = false;

    $: transX = 0;
    $: showLeft = transX != 0;
    $: if (container) {
        overflow = container.scrollWidth - container.offsetWidth;
    }


    onMount(() => {
        const observer = new ResizeObserver(entries => {
            if (!container) return;

            for (let entry of entries) {

                container = container;
                

                clearTimeout(resizeTimeout);
                
                resizeTimeout = setTimeout(() => {
                    const contBox = container.getBoundingClientRect();
                    const listBox = list.getBoundingClientRect();

                    showRight = getLastItem().getBoundingClientRect().right > contBox.right;

                    const currentSize = entry.contentRect.width;

                    // if the screen grew
                    if ((currentSize > lastSize && showRight === false)) {
                        transX = Math.min(0, transX + translateAmountForLastAtEnd());
                        showRight = false;
                    }

                    lastSize = currentSize;
                }, 100);
            }
        });

        observer.observe(container);

        return () => {
            clearTimeout(resizeTimeout);
            clearTimeout(focusTimeout);
        }
    });

    async function rightClick() {
        const li = getEndItem();
        if (!li) return;

        const parent = container.getBoundingClientRect();
        const child = li.getBoundingClientRect();

        // const offset = parent.right - child.left;
        // let newTransX = transX - parent.width + offset + buttonWidth + padding;
        let newTransX = transX - (child.left - parent.left) + buttonWidth + padding;

        const lastTransX = transX + translateAmountForLastAtEnd();

        if (lastTransX > newTransX) {
            newTransX = lastTransX;
            showRight = false;
            overflow = 0;
        }

        newTransX = Math.floor(newTransX);

        if (transX === newTransX) {
            showRight = false;
            return;
        }

        transX = newTransX;

    }

    // the amount we'd need to translate to put the last element at its end position
    function translateAmountForLastAtEnd() {
        const parent = container.getBoundingClientRect();
        const last = getLastItem().getBoundingClientRect();
        return -(last.right - parent.right + padding);
    }

    async function leftClick() {
        showRight = true;
        transX = Math.min(0, transX + 300);
    }

    async function onFocusIn(e: FocusEvent, index: number) {
        const contBox = container.getBoundingClientRect();
        const listBox = list.getBoundingClientRect();

        if (listBox.width < contBox.width) return;

        // prevent container from scrolling when li's are tabbed to
        container.scrollLeft = 0;

        clearTimeout(focusTimeout);
        
        focusTimeout = setTimeout(async () => {
            const li = e.target as HTMLLIElement;
            
            if (index === 0) {
                transX = 0;
                showRight = true;
            } else if (index === links.length - 1) {
                console.log("LAST");
                showRight = false;
                transX = Math.floor(transX + translateAmountForLastAtEnd());
            } else if (isAtEnd(li)) {
                console.log("AT END");
                translateToEnd(li);
            } else if (isAtStart(li)) {
                showRight = true;
                translateToStart(li);
            }
        }, 50);
    }

    function isAtEnd(li: HTMLElement) {
        if (!right) return false;
        return isIntersecting(right, li) || isOverflownEnd(container, li);;
    }

    function isAtStart(li: HTMLElement) {
        if (!left) return false;
        return isIntersecting(left, li) || isOverflownStart(container, li);
    }

    function findItem(func: (li: HTMLElement) => Boolean) {
        const li = Array.from(list.children).find((li) => {
            return (li instanceof HTMLLIElement) && func(li);
        });

        if (li) {
            return li as HTMLLIElement;
        }
    }

    function translateToStart(li: HTMLLIElement) {
        const parent = container.getBoundingClientRect();
        const item = li.getBoundingClientRect();
        const amountToMove = parent.left - item.left + padding + buttonWidth;
        transX += amountToMove;
    }

    function translateToEnd(li: HTMLLIElement) {
        const parent = container.getBoundingClientRect();
        const item = li.getBoundingClientRect();
        const amountToMove = item.right - parent.right + padding + buttonWidth;
        transX -= amountToMove;
    }

    const getFirstItem = () => list.firstElementChild as HTMLLIElement;
    const getLastItem = () => list.lastElementChild as HTMLLIElement;
    const getEndItem = () => findItem(isAtEnd); 
    const getStartItem = () => findItem(isAtStart); 
    

</script>

{#if container}
    <div class="border-b border-slate-700 p-2 flex gap-2" transition:fly={{x: -300}}>
        <span>Scroll: {container.scrollWidth}</span>
        <span>Offset: {container.offsetWidth}</span>
        <span>Overflow: {overflow}</span>
        <span>Translate: {transX.toFixed(2)}</span>
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
                class={`absolute top-0 left-0 z-50 h-full flex justify-start items-center bg-gradient-to-l from-transparent from-5% via-slate-900/90 via-30%  to-slate-900 border-r border-red-700`}
                style={`width: ${buttonWidth}px`}
                bind:this={left}
            >
                <button
                    type="button"
                    class={`p-4 flex justify-center items-center rounded-full border border-slate-700 bg-slate-900/75 w-8 h-8 ml-4`}
                    on:click={leftClick}
                >
                    &lt;
                </button>
            </div>
        {/if}



        <div id="chip-scroller" bind:this={scroller} 
            class="transition transform ease-in-out flex items-center relative"
            style={`transform: translateX(${transX}px);`}
        >
            <ul class="flex gap-4 w-fit" bind:this={list}>
                {#each links as d, i}
                    <li
                        on:focusin={e => onFocusIn(e, i)}
                    >
                        <a href={d.href} 
                            target="_blank"
                            class="block bg-slate-800 py-1 px-4 rounded-md
                            hover:bg-slate-950 focus-visible:outline-none focus-visible:ring-1 ring-violet-600"  
                        >
                            <span class="whitespace-nowrap">{d.text}</span>
                            <div>HELLO!</div>
                        </a>
                    </li>
                {/each} 
            </ul>
        </div>

       
        {#if showRight}
            <div
                in:fly={{ x: 100 }}
                out:fly={{ x: 100 }} 
                class={`absolute top-0 right-0 z-50 h-full flex justify-end items-center bg-gradient-to-r from-transparent from-5% via-slate-900/70 via-30%  to-slate-900 border-l border-red-700`
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

    <!-- <div class="flex items-center border-l border-slate-700 px-4">
        EAT UP SPACE
    </div> -->

</nav>