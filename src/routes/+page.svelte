<script lang="ts">
    let count=0;
    function gog(){
        console.log(1)
        count=count+1
    }
</script>
<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation {count}</p>
<button on:click={gog}>dowekdowekd</button>