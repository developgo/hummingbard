<script>
import { createEventDispatcher } from 'svelte';
const dispatch = createEventDispatcher();

import ImageItem from './image-item.svelte'
export let store;

</script>


{#if store.images?.length > 0}
<div class="image-items flex flex-wrap mb3">
    {#each store?.images as image,i (image.id)}
        <ImageItem 
            on:deleteImage
            on:updateImageURL
            on:updateImageMetadata
            image={image} 
            index={i}/>
    {/each}
</div>
{/if}

<style>
.image-items div:last-child{
    margin-bottom: 0;
}
</style>
