<script>
import {onMount} from 'svelte'
import ImageItem from './gallery-image.svelte'
import {addedPosts} from '../timeline/store.js'

let posts = [];

let active = false;

onMount(() => {
    let items = window.timeline?.initialPosts?.filter(x => x.type == "com.hummingbard.post")
    console.log("items", items)
    if(items.length > 0) {
      items.forEach(post => {
        post.hydrated = true
        posts.push(post)
        posts = posts
      })
    }
    if(items.length > 22){
        loadMore()
    }
})

let More;
let moreLoaded = false;
function loadMore() {
    import('./more.svelte').then(res => {
        More = res.default
        moreLoaded = true
        active = true
    })
}

</script>

{#if posts.length == 0 && $addedPosts.length == 0}
    <div class="gr-default h-100">
        <div class="gr-center">
            No images in this gallery yet.
        </div>
    </div>

{/if}

{#if posts.length >0 || $addedPosts.length > 0}
<div class="gallery-items flex">

    {#if $addedPosts.length > 0}

        {#each $addedPosts as event (event.event_id)}
            {#if event.type == 'com.hummingbard.post'}
                <ImageItem post={event} />
            {/if}
        {/each}

    {/if}
    {#if posts.length > 0}

        {#each posts as event (event.event_id)}
            {#if event.type == 'com.hummingbard.post'}
                <ImageItem post={event} />
            {/if}
        {/each}

    {/if}

</div>
{/if}

{#if active}
    <More/>
{/if}

<style>
</style>
