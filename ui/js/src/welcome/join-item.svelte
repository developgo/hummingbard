<script>
import {onMount, createEventDispatcher} from 'svelte'
const dispatch = createEventDispatcher();
export let room;

let joined = false;

let toggled = false;

async function toggleJoineRoom() {
    let endpoint = `/room/join`

    if(joined) {
        endpoint = `/room/leave`
    }

    let data = {
        id: room.room_id,
        alias: room.room_alias,
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

function toggleJoin() {

    toggled = !toggled

  toggleJoineRoom().then((res) => {
    console.log("joined?: ",res)
      if(res?.joined) {
          joined = true
          toggled = true
      } else if(res?.left) {
          joined = false
          toggled = false
      }
  }).then(() => {
      dispatch('touch', true)
  })
}


$: room_id = room.room_id


$: avatarExists = room?.avatar_url?.length > 0


function avatarSrc(avatar) {
    let av = `${homeserverURL}/_matrix/media/r0/thumbnail/${avatar?.substring(6)}?width=32&height=32&method=crop`
    return av
}

function processAlias(alias) {
    alias = alias?.replaceAll("_","/")
    if(alias?.includes(window.location.hostname)) {
        let sp = alias?.split(":")
        return sp[0]
    }
    return alias
}



</script>

<div class="mr3 mb3 no-select" on:click={toggleJoin}>
    <div class="item flex" class:item-joined={toggled}>
        <div class="">
            {#if !toggled}
                {#if avatarExists}
                    <img src="{avatarSrc(avatar)}" />
                {:else}
                    <svg class="gr-center" height="23" width="23">
                        <circle cx="11.5" cy="11.5" r="11.5" stroke-width="0" fill="black" />
                    </svg>
                {/if}
            {:else}
                <div class="tick gr-default">
                    <svg class="gr-center" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"></path></svg>
                </div>
            {/if}
        </div>
        <div class="gr-default">
            <div class="gr-center ph2">
                {room.room_path}
            </div>
        </div>
    </div>
</div>


<style>

.item {
    cursor: pointer;
    border-radius: 500px;
    border: 1px solid var(--primary-dark-gray);
    font-size: 0.8rem;
    font-weight: bold;
    padding: 0.25rem;
    background: var(--m-bg);
    box-shadow: 0 30px 60px rgba(0,0,0,.07);
}
.item:hover {
    border: 1px solid var(--primary-dark);
}

.item-joined {
    background: var(--primary-darkest);
    border: 1px solid var(--primary-darkest);
    color: var(--white);
}

.item img {
    height: 23;
    width: 23;
    border-radius: 50%;
}

.tick {
    background-color: var(--white);
    height: 23px;
    width: 23px;
    border-radius: 50%;
    stroke-width: 3px;
}
</style>
