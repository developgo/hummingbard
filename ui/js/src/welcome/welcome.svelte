<script>
import JoinItem from './join-item.svelte'

$: items = window?.state?.rooms

let touched = false;

function onTouch(e) {
  touched = true
}

$: hide = `bob` || `david` || `new`
</script>

<div class="gr-center flex flex-column w-100">
  <div class=" gr-center">
    <strong>Join some Spaces!</strong>
  </div>
  <div class="mt4 flex flex-wrap gr-center justify-center">
    {#each items as room (room.room_id)}
      {#if room.room_path != hide}
        <JoinItem on:touch={onTouch} room={room} />
      {/if}
    {/each}
  </div>
  <div class="mt4 flex flex-wrap gr-center">
    <a href="/">
      <button class="">{touched ? 'Done' : 'Skip'}</button>
    </a>
  </div>
</div>
