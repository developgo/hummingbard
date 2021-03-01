<script>
import { createEventDispatcher } from 'svelte';
const dispatch = createEventDispatcher();

export let store;


$: active = store?.nsfw

$: bg = active ? `--red` : `--primary-grayish`
$: col = active ? `--white` : `--primary-text`

$: tip = active ? `Unmark as NSFW` : `Mark as NSFW`

function toggle() {
  dispatch('toggleNSFW')
}

</script>

<div class=""
     aria-label={tip}
  data-microtip-position="bottom"
  data-microtip-size="fit"
  role="tooltip">
  <button 
    class="nsfw-button" 
    style="background: var({bg});color:var({col});" 
    on:click={toggle}>
    NSFW
  </button>
</div>

<style>
.nsfw-button {
  padding: 0.125rem 0.25rem;
  color: black;
  border: 0;
  font-size: small;
  font-weight: bold;
  border-radius: 4px;
}
</style>

