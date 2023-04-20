<script>
    import { docs } from "@lib/util";
    import Chips from "./Chips.svelte";
    import Chip from "./Chip.svelte";
</script>


<Chips>
    {#each docs as d, i}
        <Chip>
            <a href="/#" class="bg-slate-800 whitespace-nowrap p-2 rounded-md">{d.text}</a>
        </Chip>
    {/each}
</Chips>