<script>
import { createEventDispatcher } from 'svelte';
const dispatch = createEventDispatcher();

export let store;

$: active = store?.anonymous

$: bg = active ? `--primary-dark` : `--primary-grayish`
$: col = active ? `--white` : `--primary-text`

$: tip = active ? `Post as yourself` : `Post Anonymously`

function toggle() {
  dispatch('toggleAnonymous')
}

</script>


<div class=""
   aria-label={tip}
  data-microtip-position="bottom"
  data-microtip-size="fit"
  role="tooltip">
  <button 
    class="anonymous-button" 
    style="background: var({bg});color:var({col});" 
    on:click={toggle}>
    ANON
  </button>
</div>

<style>
.anonymous-button {
  padding: 0.125rem 0.25rem;
  color: black;
  border: 0;
  font-size: small;
  font-weight: bold;
  border-radius: 4px;
}
</style>


