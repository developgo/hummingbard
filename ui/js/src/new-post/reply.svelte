<script>
import {getPostByShortId} from '../timeline/store.js'
export let id;

let active = false;

function killed() {
  active = false
}

let View;
let viewLoaded;
function activate() {
  import('../new-post/view/view.svelte').then(res => {
    View = res.default
    viewLoaded = true
    active = true
  })
}

$: post = getPostByShortId(id)

</script>


  {#if !active}
  <div class="flex-one"></div>
  <div class="pointer" title="reply" on:click={activate}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M6.78 1.97a.75.75 0 010 1.06L3.81 6h6.44A4.75 4.75 0 0115 10.75v2.5a.75.75 0 01-1.5 0v-2.5a3.25 3.25 0 00-3.25-3.25H3.81l2.97 2.97a.75.75 0 11-1.06 1.06L1.47 7.28a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 0z"></path></svg>
  </div>
  {:else}
    {#if active && viewLoaded}
      <View 
        reply={true} 
        eventID={post?.event_id}
        on:killed={killed}/>
    {/if}
  {/if}


