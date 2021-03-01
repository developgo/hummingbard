<script>
import {fade} from 'svelte/transition'
import {onMount} from 'svelte'

let active = false

function editPage() {
    loadMarkdown()
    active = true
}

function kill() {
    content = window.timeline?.initialPosts?.[0]?.content?.body
    active = false
}


let Markdown;
function loadMarkdown() {
  import('./markdown.svelte').then(res => {
    Markdown = res.default
    loadEditor()
  })
}

let editor;
let Editor;
let editorLoaded;
function loadEditor() {
  import('../editor/editor.svelte').then(res => {
    Editor = res.default
    editorLoaded = true
  })
}

let content = window.timeline?.initialPosts?.[0]?.content?.body

function sync() {
    content = editor.getContent().plain_text
}


onMount(() =>{
})

async function createPost() {
    let endpoint = `/post/create`

    let data = {
        room_id: window.timeline.room_id,
        room_alias: window.timeline.alias,
        post: {
          content: {
              text: content,
          },
          article: {
            enabled: false,
          }
        },
        page: true,
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

function save() {
  createPost().then((res) => {
    console.log(res)
    if(res?.post) {
        //location.reload()
    } else {
    }
  }).then(() => {
  })

}

</script>

<div class="gr-center">
    <div class="edit-page">
        <button class="" on:click={editPage}>Edit Page</button>
    </div>
</div>



{#if active && editorLoaded}
<div class="modal-container main ph3" transition:fade="{{duration: 33}}">

  <div class="modal-inner-np start flex flex-column " >

    <div class="flex flex-column gr-default">


        <div class="editor-c">

            <div class="editor-cc">

                <div class="pa3 mxh scrl">
                    <Editor 
                    fullHeight={true} 
                    editing={true} 
                    initial={content} 
                    bind:this={editor} 
                    on:sync={sync}/>
                </div>

                <div class="sep"></div>

                <div class="pa3 mxh scrl">
                    <Markdown content={content}/>
                </div>

            </div>

            <div class="editorc pa3">
                <button class="" on:click={save}>Save</button>
                <button class="light" on:click={kill}>Cancel</button>
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
    width: 90vw;
    height: 90vh;
}

.tab-item {
  background: var(--m-bg);
  color: var(--text);
  padding: 0;
  padding-bottom: 0.5rem;
  margin: 0;
  margin-right: 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  border-bottom: 1px transparent;
}

.tab-item:hover {
  border-bottom: 1px solid var(--primary-gray);
}

.active-tab {
  border-bottom: 1px solid var(--primary-dark);
  font-weight: bold;
}

.tab-view {
  min-height: 60vh;
}

.editor-c {
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: [editor] 1fr [tools] auto;
}

.editor-cc {
  display: grid;
  grid-template-rows: auto;
  grid-template-columns: [editor] 1fr [sep] auto [preview] 1fr;
}

.sep {
    width: 2px;
    background: var(--primary-light-gray);
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


.mxh {
    max-height: 90vh;
    overflow-y: auto;
}

</style>

