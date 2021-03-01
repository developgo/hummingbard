<script>
export let members;

$: text = window.timeline?.profile ? `Follower` : `Member`


let expanded = false;

async function fetchRoomMembers() {
    let endpoint = `/room/members`


    let data = {
        room_id: window.timeline.room_id,
    }

    let options = {
        method: 'POST',
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

let fetching = false;


let items = [];

function toggle() {
  if(expanded) {
    expanded = false
    return
  }
  fetching = true
  fetchRoomMembers().then((res) => {
    console.log(res.members)
    if(res?.members) {
      items = res.members
      expanded = true
    }
  }).then(() => {
    fetching = false
  })
}

function user(user_id) {
  if(user_id.includes(window.location.hostname)) {
    let x = user_id.split(":")
    return x[0]
  }
  return user_id
}


function show(user_id) {
  let anon = `@anonymous:${window.location.hostname}`
  let operator = `@${window.location.hostname}:${window.location.hostname}`
    /*
  if(user_id.includes(anon) || user_id.includes(operator)) {
    return false
  }
  */
  return true
}

</script>

<div class="fs-09 flex room-members pointer" on:click={toggle}>
  <div class="flex-one">
    <strong>{members}</strong> {text}{members >1 ? 's' :''}
  </div>
  <div class="gr-default pointer o-60 hov-op">
    {#if !expanded}
      <svg class="gr-center" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M12.78 6.22a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06 0L3.22 7.28a.75.75 0 011.06-1.06L8 9.94l3.72-3.72a.75.75 0 011.06 0z"></path></svg>
    {:else}
      <svg class="gr-center" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M3.22 9.78a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 0l4.25 4.25a.75.75 0 01-1.06 1.06L8 6.06 4.28 9.78a.75.75 0 01-1.06 0z"></path></svg>
    {/if}
  </div>
</div>

{#if expanded}
  <div class="mt3 m-list scrl">
    {#each Object.entries(items) as [user_id, details]}
      {#if show(user_id)}
        <div class="small mb2">
            <a href="/{user(user_id)}"><span class="primary">{user(user_id)}</span></a>
        </div>
      {/if}
    {/each}
  </div>
{/if}

{#if fetching}
  <div class="mt3 gr-default">
    <div class="lds-ring gr-center"><div></div><div></div><div></div><div></div></div>
  </div>
{/if}


<style>

.m-list {
  max-height: 200px;
  overflow-y:auto;
}
</style>
