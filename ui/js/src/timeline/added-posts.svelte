<script>
import { addedPosts } from './store.js'

$: if($addedPosts.length > 0) {
    loadPost()
}

$: permalink = window.timeline?.permalink

let Post;
let postLoaded = false;
function loadPost() {
    import('../post/post.svelte').then(res => {
        Post = res.default
        postLoaded = true
    })
}
</script>

{#if postLoaded}
    {#each $addedPosts as post (post.event_id)}
        <svelte:component this={Post} post={post} reply={permalink ? true : false}/>
    {/each}
{/if}
