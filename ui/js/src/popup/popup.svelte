<script>
import tippy from 'tippy.js'
import {onMount} from 'svelte'
import { makeid } from '../utils/utils.js'

onMount(() => {
    init()
})


function init() {
  tippy('.focusable', {
    allowHTML: true,
    theme: "popup",
    placement: "top",
    duration: 60,
      distance: 0,
    interactive: true,
    arrow: true,
    content: "lol"
  });
}

async function FetchRoom(room_id) {

    let endpoint = `/room/info`

    let data = {
        room_id: room_id,
    };

    let headers = {
        'Content-Type': 'application/json'
    }
    
    if(authenticated && identity?.access_token) {
      headers['Authorization'] = identity.access_token
    }

    let options = {
        method: 'POST', // or 'PUT'
        body: JSON.stringify(data),
        headers: headers,
    }

    let resp = await fetch(endpoint, options)

    const ret = await resp.json()
    return Promise.resolve(ret)

}



let fetchedRooms = []

let addRoom = (room) => {
  fetchedRooms.push(room)
}

let roomExists = (room_id) => {
  let ind = fetchedRooms.findIndex(x => x.id === room_id)
  if(ind != -1) {
    return {
      exists: true,
      room: fetchedRooms[ind],
    }
  }
  return false
}

function buildDOM(room, room_id) {

  let content = `
    <div class="popup pa3 scrl flex flex-column" >
    ${room}
    </div>
  `


  return content
}

function buildErrorDOM() {

  let content = `
    <div class="mention-pop scrl flex flex-column pa4 tc" >
      Missing or deleted.
    </div>
  `

  return content
}

function buildLoading() {

  let content = `
    <div class="popup pa3 gr-default" >
      <div class="lds-ring gr-center"><div></div><div></div><div></div><div></div></div>
    </div>
  `

  return content
}

</script>
