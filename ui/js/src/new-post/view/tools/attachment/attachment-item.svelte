<script>
import {onMount, onDestroy} from 'svelte'
import { createEventDispatcher } from 'svelte';
const dispatch = createEventDispatcher();

export let store;

import {formatBytes} from '../../../../utils/utils.js'
export let attachment;

let uploaded = false;

$: src = `url(${attachment.url})`


$: size = formatBytes(attachment.file.size)

onMount(() => {
  uploadAttachment().then((res) => {
    console.log(res)
      if(res?.content_uri) {
          uploaded = true
        dispatch('updateAttachmentURL', {
          id: attachment.id,
          content_uri: res.content_uri
        })
      }
  }).then(() => {
  })

})

onDestroy(() => {
  dispatch('deleteAttachment', attachment.id)
})

async function uploadAttachment() {
    let endpoint = `${homeserverURL}/_matrix/media/r0/upload`

  if(identity?.federated && identity?.well_known?.length > 0) {
    endpoint = `${identity.well_known}/_matrix/media/r0/upload`
  }

  console.log(endpoint)

    let resp = await fetch(endpoint, {
    method: 'POST', // or 'PUT'
    body: attachment.file,
      headers:{
          'Authorization': `Bearer ${identity.matrix_access_token}`,
          'Content-Type': attachment.file.type
      }
    })


    const ret = await resp.json()
    return Promise.resolve(ret)
}

$: single = store?.attachments?.length == 1

function killMe() {
  dispatch('deleteAttachment', attachment.id)
}

</script>

<div class="attachment-item flex flex-column w-100" class:mb3={!single}>

  <div class="flex">
    <div class="fs-09 primary flex-one gr-center lh-copy">
      {attachment.file.name}
    </div>
    {#if !uploaded}
        <div class="gr-default mr3">
          <div class="lds-ring gr-center"><div></div><div></div><div></div><div></div></div>
        </div>
      {/if}
    <div class="">
        <div class="pointer o-70 hov-op" on:click={killMe}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill-rule="evenodd" d="M1 12C1 5.925 5.925 1 12 1s11 4.925 11 11-4.925 11-11 11S1 18.075 1 12zm8.036-4.024a.75.75 0 00-1.06 1.06L10.939 12l-2.963 2.963a.75.75 0 101.06 1.06L12 13.06l2.963 2.964a.75.75 0 001.061-1.06L13.061 12l2.963-2.964a.75.75 0 10-1.06-1.06L12 10.939 9.036 7.976z"></path></svg>
        </div>
    </div>
  </div>

  <div class="mt3 small">
    {attachment.file.type} - {size}
  </div>

</div>


<style>

.attachment-item:last-child{
    margin-bottom: 0;
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
</style>
