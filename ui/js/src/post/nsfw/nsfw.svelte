<script>
export let id;

function killNSFW() {
  let el = document.querySelector(`#nsfw-${id}`)
  if(el) {
    el.remove()
  }
}

</script>

<div class="gr-center small">
  NSFW. <span class="primary pointer hov-un" on:click={killNSFW}>Click to View</span>
</div>

