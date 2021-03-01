<script>
export let post;


$: first = post?.content?.images?.[0]

$: multiple = post?.content?.images?.length > 1

function src(item) {
    return `${homeserverURL}/_matrix/media/r0/download/${item?.mxc}`
}

$: link = `/${window.timeline?.room_path}/${post.event_id}`

</script>

<div class="gallery-image relative">
    <a href={link}>

        <div class="g-i" style="background-image:url({src(first)});">
        </div>
        <div class="g-m"></div>

        {#if multiple}
            <div class="mul">
                {#each post?.content?.images as image}
                   <svg class=" ml1" height="6" width="6">
                     <circle cx="3" cy="3" r="3" stroke-width="0" fill="white" />
                   </svg>
                {/each}
            </div>
        {/if}

    </a>
</div>


<style>
.g-i {
    width: 100%;
    height: 0%;
    padding-bottom: 100%;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
}

.g-m {
    width: 100%;
    height: 100%;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    background: #000;
    opacity: 0;
    position: absolute;
    cursor: pointer;
    transition: 0.1s;
}
.g-m:hover {
    opacity: 0.2;
}

.mul {
    position: absolute;
    top: 1rem;
    right: 1rem;
    fill: white;
}
</style>
