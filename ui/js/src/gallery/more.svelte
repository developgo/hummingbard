<script>
import { onMount } from 'svelte'
import { addPosts } from '../timeline/store.js'

export let type;

let last;

let posts = [];

let loading = false;
let noMore = false;


let Post;
let postLoaded = false;
function loadPost() {
    import('./gallery-image.svelte').then(res => {
        Post = res.default
        postLoaded = true
    })
}

onMount(() => {
    clientHeight = document.body.clientHeight
    observer = new IntersectionObserver(callback, options);
    observer.observe(obs);
})

async function fetchFollowing() {
    let endpoint = `/messages/fetch`

    let data = {
        id: window.timeline.room_id,
        end: window.timeline.end
    }

  if(window?.timeline?.permalink) {
    data.id = window.timeline.thread_in_room_id
      data.permalink = true
  }

    let options = {
        method: 'POST', // or 'PUT'
        body: JSON.stringify(data),
        headers:{
            'Content-Type': 'application/json'
        }
    }



    if(authenticated && identity?.access_token) {
        options.headers['Authorization'] = identity.access_token
    }
    console.log(options)

    let resp = await fetch(endpoint, options)
    const ret = await resp.json()
    return Promise.resolve(ret)
}

function loadMore() {
     loading = true
  fetchFollowing().then((res) => {
    console.log("Fetched posts: ",res)
    if(!postLoaded) {
        loadPost()
    }
      if(res && res.last_event) {
          last = res.last_event
      }
      if(res?.posts?.length > 0) {
          addPosts(res.posts)
          res.posts.forEach(post => {
              if(post.type == `com.hummingbard.post`) {
                posts = [...posts, post];
              }
          })
          console.log("Update store posts: ", posts)
      }
      if(res?.last_event == `t0_0`) {
          noMore = true
      }
  }).then(() => {
     loading = false
  })
}


let observer;
let obs;
let clientHeight = document.body.clientHeight;
let options = {
    root: obs,
    rootMargin: `${clientHeight / 2.7}px`,
    threshold: 0.5,
}


function callback(entries, observer) {
  entries.forEach(entry => {
    if(entry.isIntersecting) {
      loading = true
      loadMore()
    }
  })
}


</script>


<div class="more-posts flex flex-column mt3">
  <div class="gallery-items">
    {#if postLoaded}

        {#each posts as event (event.event_id)}
            {#if event.type == 'com.hummingbard.post'}
                {#each event?.content?.images as image (image.mxc)}
                    <svelte:component this={Post} image={image}/>
                {/each}
            {/if}
        {/each}

    {/if}
  </div>
    <div class="load-more">
        {#if !noMore}
            <button class="" on:click={loadMore}>Load More</button>
        {:else}
            No More Posts
        {/if}
    </div>
  <div bind:this={obs}>
  </div>
</div>

