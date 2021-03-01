<script>
import {onMount} from 'svelte'
import {fade} from 'svelte/transition'
import CreateRoom from '../../../../create-room/create-room.svelte'
import SpaceItem from './space-item.svelte'

let adding = false;

function toggle() {
  if(!adding) {
    level = window.timeline?.room_path
    adding = true
    return
  }
}
function cancel() {
  adding = false
}

let level = window.timeline?.room_path

let items = window.timeline?.children

function created(e) {
  console.log("room created!", e.detail)
  if(roomID == window.timeline?.room_id) {
    items = [...items, e.detail]
  } else {
    addRoom(e.detail)
  }
  adding = false
}

let roomID;

onMount(() => {
  roomID = window.timeline?.room_id
})

function select(e) {
  console.log("sent", e.detail)
  roomID = e.detail.room_id
  level = e.detail.path
  adding = true
}

function addRoom(room) {
  findChildren(items, room)
  items = items
}
function findChildren(children, room) {
  children.forEach(child => {
    if(child.children?.length > 0) {
      findChildren(child.children, room)
    }
    if(child?.room_id == roomID) {
      child.children.push(room)
    }
  })
}

</script>

<div class="flex flex-column flex-one">

  {#if !adding}
  <div class="flex">
    <div class="flex-one"></div>
    <div class="flex flex-column">
      <button class="" on:click={toggle}>Add Sub-space</button>
    </div>
  </div>
  {/if}

  {#if items.length > 0 && !adding}
    <div class="flex flex-column mb3 mt4 sub ovfl-y scrl ph3">
      {#each items as item (item.room_id)}
        <SpaceItem 
        on:select={select}
        space={item} />
      {/each}
    </div>
  {/if}


  {#if adding}
  <div class="flex flex-column"
    transition:fade="{{duration: 73}}">
    <CreateRoom 
      sub={true} 
      level={level} 
      roomID={roomID}
      on:created={created} 
      on:cancel={cancel}/>
  </div>
  {/if}

</div>

<style>
.sub {
  max-height: 300px;
}
</style>
