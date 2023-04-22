<script>
    import { docs } from "@lib/util";
    import Chips from "@components/Chips/Chips.svelte";
</script>


<div class="border-b border-slate-700">
    <Chips padding={12}>
        {#each docs as d}
            <li>
                <a href={d.href} target="_blank" class="block bg-slate-800 whitespace-nowrap py-1 px-5 border border-slate-700 rounded-full">{d.text}</a>
            </li>
        {/each}
    </Chips>
</div>