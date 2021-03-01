<script>
import {onMount, onDestroy} from 'svelte'

import { createEventDispatcher } from 'svelte';
const dispatch = createEventDispatcher();

export let store;
export let image;
export let index;

let uploaded = false;

$: src = `url(${image.url})`

function killMe() {
  dispatch('deleteImage', image.id)
}

onMount(() => {
  if(index == 0) {
    captionInput.focus()
  }
  uploadImage().then((res) => {
    console.log(res)
      if(res?.content_uri) {
          uploaded = true
        dispatch('updateImageURL', {
          id: image.id,
          content_uri: res.content_uri,
        })
      }
  }).then(() => {
  })

})

onDestroy(() => {
    dispatch('deleteImage', image.id)
})

async function uploadImage() {
    let endpoint = `${homeserverURL}/_matrix/media/r0/upload`

  console.log(endpoint)

  if(identity?.federated && identity?.well_known?.length > 0) {
    endpoint = `${identity.well_known}/_matrix/media/r0/upload`
  }

    let resp = await fetch(endpoint, {
    method: 'POST', // or 'PUT'
    body: image.file,
    headers:{
        'Authorization': `Bearer ${identity.matrix_access_token}`,
        'Content-Type': image.file.type
    }
    })
    const ret = await resp.json()
    return Promise.resolve(ret)
}



$: single = store?.images?.length == 1

let caption;
let description;
let captionInput;
let descriptionInput;

function updateMetadata() {
  dispatch('updateImageMetadata', {
    id: image.id,
    metadata: {
      caption: captionInput.value,
      description: descriptionInput.value,
    }
  })
}

</script>


<div class="ii-c flex w-100" class:mb3={!single}>
  <div class="image-item mr3 relative" 
       style="background-image: {src}">

      {#if !uploaded}
        <div class="image-mask"></div>

        <div class="loading ">
          <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
        </div>
      {/if}

      <div class="discard pointer o-70 hov-op" on:click={killMe}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill-rule="evenodd" d="M1 12C1 5.925 5.925 1 12 1s11 4.925 11 11-4.925 11-11 11S1 18.075 1 12zm8.036-4.024a.75.75 0 00-1.06 1.06L10.939 12l-2.963 2.963a.75.75 0 101.06 1.06L12 13.06l2.963 2.964a.75.75 0 001.061-1.06L13.061 12l2.963-2.964a.75.75 0 10-1.06-1.06L12 10.939 9.036 7.976z"></path></svg>
      </div>

  </div>
  <div class="i-gr flex flex-column flex-one">
    <div class="">
      <input 
        bind:this={captionInput}
        bind:value={caption}
        on:input={updateMetadata}
      placeholder="Caption"/>
    </div>
    <div class="mt2">
      <textarea 
        bind:this={descriptionInput}
        bind:value={description}
        on:input={updateMetadata}
      placeholder="Description"></textarea>
    </div>
  </div>
</div>


<style>

.iic:last-child {
  margin-bottom: 0;
}
.image-item {
    width: 120px;
    height: 120px;
    border-radius: 13px;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
}

.uploading {
    opacity: 0.5;
}

.discard {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
}

.loading {
    position: absolute;
    bottom: 0.5rem;
    left: 0.5rem;
}

.image-mask {
    background: white;
    opacity: 0.3;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
}

.i-gr {
  display: grid;
  grid-template-rows: auto 1fr;
}

input {
  width: 100%;
  font-size: 0.9rem;
}

textarea {
  font-size: 0.9rem;
  height: 100%;
  width: 100%;
  resize: none;
}

</style>
