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


function edit(id) {
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

onMount(() => {
  window.editPost = (id) => {
    edit(id)
  }
})

function kill() {
  active = false;
}

$: placeholder = `Edit this post.`


let shareWith;

let shareItems = [
    {id: identity.room_id, alias: `#${identity.user_id}`, text: 'Your Profile'},
]

let items = identity?.joined_rooms?.filter(x => (x.room_alias != '' && !x.room_alias.includes('@')))
items?.forEach(item => {
  shareItems.push({
    id: item.room_id,
    alias: item.room_alias,
    text: processText(item.room_alias),
  })
})

function processText(text) {
  return text
}

let content = {
  plain_text: null,
  html: null,
}

let locked = false;

function saveEdit() {
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
    let endpoint = `/post/edit`

    let data = {
      room_id: post.room_id,
      event_id: post.event_id,
      content: content.plain_text,
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
        <span class=" fs-09"><strong>Edit post</strong></span>
      </div>


      <div class="flex mt3 h-100" class:no-click={locked}>

        <Editor bind:this={editor} 
          editing={true}
          placeholder={placeholder}
          initial={post.content.body}/>

      </div>


      <div class="flex mt2">

        <div class="flex-one">
        </div>
        {#if locked}
          <div class="gr-default mr3">
            <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
          </div>
        {/if}

        <div class="">
          <button class="" on:click={saveEdit} disabled={locked}>Save</button>
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
