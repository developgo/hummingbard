<script>
import { fade} from 'svelte/transition'
import {addedPosts} from '../timeline/store.js'
import {onMount, onDestroy, createEventDispatcher} from 'svelte'
import {post} from '../new-post/store.js'
import {makeid} from '../utils/utils.js'
import ImageItem from '../new-post/view/tools/image/image-item.svelte'

let images = []

function deleteImage(e) {
  let ind = images.findIndex(x => x.id === e.detail)
  if(ind != -1) {
    images.splice(ind, 1)
    images = images
  }
}

function updateImageURL(e) {
  let ind = images.findIndex(x => x.id === e.detail.id)
  if(ind != -1) {
    images[ind].mxc = e.detail.content_uri
  }
}

function updateImageMetadata(e) {
  let metadata = e.detail
  let ind = images.findIndex(x => x.id === metadata.id)
  if(ind != -1) {
    images[ind].caption = metadata.metadata.caption
    images[ind].description = metadata.metadata.description
  }
}


let imageInput;

let files = [];
let count = 0;

export let imageAllowed = true;


function add() {
    if(!imageAllowed) {
        return
    }
    if($post.images.length >= 14) {
        return
    }
    imageInput.click()
}

let active;
function kill() {
    post.kill()
    active = false
}


let build = (e) => {
    console.log("how many files we got here?", e.target.files.length)
    if(count + e.target.files.length > 14) {
        alert("That's too many images for one post.")
        return
    }
    for(let i =0 ; i < e.target.files.length ; i++) {

        if(e.target.files.length > 14) {
            alert("That's too many images for one post.")
            break
        }

        const allowed = ["image/jpeg", "image/jpg", "image/webp", "image/png"]

        const file = e.target.files[i]

        if (file && !allowed.includes(file.type)) {
            alert("That is not a valid image.")
          continue
        }
        if (file.size > 23000000) {
            alert("That image is too large.")
            continue
        }
        files = [...files, e.target.files[i]]


        post.lock()

    }

    count += files.length


    for(let i =0 ; i < files.length; i++) {

        var reader = new FileReader();
        const file = files[i]
        reader.readAsDataURL(file);

        reader.onload = e => {
          const content = e.target.result;

          let item = {
              id: makeid(32),
              url: URL.createObjectURL(file),
              file: file,
              caption: '',
              description: '',
              uploaded: false,
          }

          var image = new Image();
          image.src = item.url

          image.onload = () => {
            item.height = image.height
            item.width = image.width
              images = [...images, item]
              imageInput.value = ''
          }


        }
    }

    console.log("how many files here", files.length)

    files = []

    post.unlock()


    active = true

}


function create() {
  post.lock()
  createPost().then((res) => {
    console.log(res)
    if(res?.post) {
      addedPosts.add(res.post)
      kill()
    } else {
    }
  }).then(() => {
      post.unlock()
  })
}

async function createPost() {
    let endpoint = `/post/create`

    let data = {
        room_id: window.timeline.room_id,
        room_alias: window.timeline.alias,
        post: {
          content: {
              text: $post.content.plain_text,
              html: $post.content.html,
          },
        }
    }

  if(window?.timeline?.permalink && window?.timeline?.event_id) {
    //data.room_id = window.timeline.thread_in_room_id
    data.reply = true
    data.event_id = window.timeline.event_id
  }


  if(images.length > 0) {
    let items = [];
    images.forEach(image => {
      items.push({
        caption: image.caption,
        description: image.description,
        filename: image.file.name,
        size: image.file.size,
        mimetype: image.file.type,
        mxc: image.mxc,
        width: image.width,
        height: image.height,
      })
    })
    data.post.images = items
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


<input 
    type="file" 
    accept="image/jpeg, image/png, image/webp" 
    name="images"
    bind:this={imageInput} 
    on:change={build} 
    hidden 
    multiple
>


<div class="" on:click={add}>
    <button>Add Image</button>
</div>


{#if active}
{#if images.length > 0}
<div class="modal-container main ph3" transition:fade="{{duration: 33}}">

  <div class="modal-inner-np start flex flex-column " >

    <div class="pa3 flex flex-column">

      <div class="flex flex-column">
        <span class=" fs-09"><strong>Add Image</strong></span>
      </div>


      <div class="flex mt4">

        {#if images.length > 0}
        <div class="image-items flex flex-column flex-one">
            {#each images as image,i (image.id)}
                <ImageItem
                    on:deleteImage={deleteImage}
                    on:updateImageURL={updateImageURL}
                    on:updateImageMetadata={updateImageMetadata}
                    image={image} 
                    index={i}  />
            {/each}
        </div>
        {/if}

      </div>


        <div class="flex mt4">
          <div class="flex-one gr-center">
          </div>
          {#if $post.locked}
            <div class="mh3 gr-center">
              <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
            </div>
          {/if}
          <div class="">
            <button class="" on:click={create} disabled={$post.locked}>Save</button>
            <button class="light" on:click={kill}>Cancel</button>
          </div>
        </div>


    </div>


  </div>

  <div class="mask absolute" on:click={kill}></div>

</div>
{/if}
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
    width: 680px;
}
@media screen and (max-width: 680px) {
  .start {
    width: 100%;
  }
}

.center {
    align-self: center;
}

.mask {
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background: var(--mask)
}

</style>
