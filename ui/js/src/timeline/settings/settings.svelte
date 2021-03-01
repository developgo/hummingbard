<script>

import {onMount} from 'svelte'


let active = false;

let View;
let viewLoaded;
function loadSettings() {
    active = true
    if(viewLoaded) {
        return
    }
  import('./view.svelte').then(res => {
      View = res.default;
      viewLoaded = true
  })
}

onMount(() => {
  window.loadSettings = (ready) => {
    if(ready) {
      loadSettings()
    }
  }
})

function kill() {
    active = false
}

$: if(active) {
    killBodyScroll()
} else 
    unkillBodyScroll()

function killBodyScroll() {
    document.body.style.marginRight = `15px`
    document.body.style.overflowY = "hidden"
  let nav = document.querySelector('.nav-de') 
  if(nav) {
    nav.classList.add('hide')
  }
}

function unkillBodyScroll() {
    document.body.style.marginRight = 0
    document.body.style.overflowY = "scroll"
  let nav = document.querySelector('.nav-de') 
  if(nav) {
    nav.classList.remove('hide')
  }
}


</script>


{#if active && viewLoaded}
    <View on:kill={kill}/>
{/if}
