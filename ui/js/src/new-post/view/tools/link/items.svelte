<script>
import { createEventDispatcher } from 'svelte';
const dispatch = createEventDispatcher();

export let store;

import LinkItem from './link-item.svelte'

</script>

{#if store?.links.length > 0}
    {#each store?.links as link (link.id)}
        <LinkItem link={link} 
        on:deleteLink
        on:updateLinkMetadata/>
    {/each}
{/if}
