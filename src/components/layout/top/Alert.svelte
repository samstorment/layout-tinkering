<script lang="ts">
    let visible = true;
</script>

{#if visible}
    <div
        id="alert"
        class="p-2 bg-red-800 backdrop-blur text-white flex justify-between items-center"
    >
        <p>Alert!</p>
        <button
            type="button"
            class="text-xl hover:bg-red-900 aspect-square p-2 flex justify-between items-center rounded-full"
            on:click={() => (visible = false)}
        >
            &times;
        </button>
    </div>
{/if}
