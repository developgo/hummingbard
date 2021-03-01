<script>
export let id;

let active = false;

$: tl = `tl-${id}`
$: gr = `gr-${id}`

function toggle() {

  let toolong = document.querySelector(`#${tl}`)
  let gradient = document.querySelector(`#${gr}`)

  if(!active) {
    toolong.classList.remove('long')
    gradient.classList.add('dis-no')
  } else {
    toolong.classList.add('long')
    gradient.classList.remove('dis-no')
  }
  active = !active
}

</script>

<button class="small" on:click={toggle}>Read {active ? 'Less' : 'More'}</button>

