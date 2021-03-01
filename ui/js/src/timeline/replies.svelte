<script>
let items = window.timeline?.replies

$: if(items?.length > 0) {
    loadPost()
}

let Post;
let postLoaded = false;
function loadPost() {
    import('../post/post.svelte').then(res => {
        Post = res.default
        postLoaded = true
    })
}
function added(e) {
    let ind = items.findIndex(x => x.event_id == e.detail.id)
    if(ind != -1) {
        //items[ind].replies.push(e.detail.post)
    }
}
</script>

{#if postLoaded}
    {#each items as post (post.event_id)}
        <svelte:component this={Post} post={post} reply={true} on:added={added}/>
    {/each}
{:else}
<div class="tc small bold no-replies pv4">
    {#if window.timeline?.replies?.length == 0}
  No Replies
  {/if}
</div>
{/if}

