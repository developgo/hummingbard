<script>
import {fade} from 'svelte/transition'
import { onMount } from 'svelte'
import { getPostById } from '../timeline/store.js'

let active = false;

let post;
let Post;
let editor;
let Editor;
let editorLoaded;


function share(id) {
  post = getPostById(id)
  if(!post) {
    console.log("couldn't find post")
    return
  }
  import('../editor/editor.svelte').then(res => {
    Editor = res.default
    editorLoaded = true
    loadPost()
  })
}

function loadPost() {
  import('../post/post.svelte').then(res => {
    Post = res.default
    active = true
  })
}

let reply;
let replyPermalink;

onMount(() => {
  window.sharePost = (id, rep, permalink) => {
    reply = rep
    replyPermalink = permalink
    share(id)
  }
})

function kill() {
  reply = null;
  replyPermalink = null;
  active = false;
}

$: placeholder = `Say something about this post.`


let shareWith;

let shareItems = [
    {id: identity.room_id, alias: `#${identity.user_id}`, text: 'Your Profile'},
    {id: "disabled", text: '------------'},
]

let items = identity?.joined_rooms?.filter(x => (x.room_alias != '' &&
  !x.room_alias.includes('@') && !x.room_alias.includes('#public')))
items?.sort((a, b) => (a.room_alias > b.room_alias) ? 1 : -1)
items?.forEach(item => {
  shareItems.push({
    id: item.room_id,
    alias: item.room_alias,
    text: processText(item.room_alias),
  })
})

function processText(text) {
  let s = text.substring(1)
  let sp = s.split(":")
  let p = sp[0].split("_")
  let j = p.join("/")
  return j
}

let content = {
  plain_text: null,
  html: null,
}

let locked = false;

function sharePost() {
  content = editor.getContent()
  locked = true
  createPost().then((res) => {
    console.log(res)
    if(res?.post) {
      locked = false
      kill()
    } else {
    }
  }).then(() => {
  })
}

async function createPost() {
    let endpoint = `/post/create`

    let data = {
        room_id: shareWith.id,
        room_alias: shareWith.alias,
        post: {
          content: {
              text: content.plain_text,
              html: content.html,
          },
        },
      share: true,
      shared_post_id: post.event_id,
      shared_post_room_id: post.room_id,
    }

  if(reply && replyPermalink.length > 0) {
    data.share_reply = true
    data.reply_permalink = replyPermalink
  }

  console.log(data)

    let resp = await fetch(endpoint, {
    method: 'POST', // or 'PUT'
    body: JSON.stringify(data),
    headers:{
      'Authorization': identity.access_token,
        'Content-Type': 'application/json'
    }
    })
    if (resp.ok) { // if HTTP-status is 200-299
    } else {
      alert("HTTP-Error: " + resp.status);
    }
    const ret = await resp.json()
    return Promise.resolve(ret)
}

</script>


{#if active}
<div class="modal-container main ph3" transition:fade="{{duration: 33}}">

  <div class="modal-inner-np start flex flex-column " >

    <div class="pa3 flex flex-column">

      <div class="flex flex-column">
        <span class=" fs-09"><strong>Share this post</strong></span>
      </div>


      <div class="flex mt3" class:no-click={locked}>

        <Editor bind:this={editor} placeholder={placeholder}/>

      </div>

      <div class="flex mt3 no-click">

        <svelte:component this={Post} post={post} embed={true}/>

      </div>


      <div class="flex mt4">

        <div class="flex gr-center">
          <div class="gr-center fs-09">
            Share with
          </div>
          <div class="gr-center ml2">
            <select class="fs-09" bind:value={shareWith}>
                {#each shareItems as item (item.value)}
                    <option value={item} disabled={item.id === 'disabled'}>
                        { item.text }
                    </option>
                {/each}
            </select>
          </div>
        </div>

        <div class="flex-one">
        </div>
        {#if locked}
          <div class="gr-default mr3">
            <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
          </div>
        {/if}

        <div class="">
          <button class="" on:click={sharePost} disabled={locked}>Share</button>
        </div>

      </div>




    </div>


  </div>

  <div class="mask absolute" on:click={kill}></div>

</div>
{/if}


<style>
.modal-container {
    top: 0;
    left: 0;
    position: fixed;
    width: 100%;
    height: 100%;
    z-index: 49999;
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: auto;
}

.modal-inner-np {
    justify-self: center;
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: auto;
    z-index: 50000;

    background-color: var(--m-bg);
    -webkit-box-shadow: 0px 4px 24px -1px rgba(0,0,0,0.05);
    -moz-box-shadow: 0px 4px 24px -1px rgba(0,0,0,0.05);
    box-shadow: 0px 4px 24px -1px rgba(0,0,0,0.05);
    border-radius: 17px;
    transition: 0.1s;
    word-break: break-word;
}

.start {
    align-self: center;
    width: 728px;
}
@media screen and (max-width: 680px) {
  .start {
    width: 100%;
  }
}

.mask {
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background: var(--mask)
}



</style>
