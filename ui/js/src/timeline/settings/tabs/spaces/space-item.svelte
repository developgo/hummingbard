<script>
import {createEventDispatcher} from 'svelte'
import {fade} from 'svelte/transition'
export let space;
export let nested = false;
export let expand;

const dispatch = createEventDispatcher();

$: hasChildren = space?.children?.length > 0


function select() {
  dispatch('select', space)
}

</script>


<div class="">
  <div class="item ph3 pv2 mb2 flex" class:ml3={nested}>
    <div class="fs-09 primary">
      {space.alias}
    </div>
    <div class="flex-one"></div>
    <div class="pointer" on:click={select}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M7.75 2a.75.75 0 01.75.75V7h4.25a.75.75 0 110 1.5H8.5v4.25a.75.75 0 11-1.5 0V8.5H2.75a.75.75 0 010-1.5H7V2.75A.75.75 0 017.75 2z"></path></svg>
    </div>
  </div>

  {#if hasChildren}
    <div class="" class:ml3={nested}
    transition:fade="{{duration: 63}}">
      {#each space.children as item (item.room_id)}
        <svelte:self 
          on:select
          space={item}
          nested={true}
        />
      {/each}
    </div>
  {/if}
</div>

<style>
.item {
  border-radius: 500px;
  border: 1px solid var(--primary-grayish);
  transition: 0.05s;
}
.item:hover {
  border: 1px solid var(--primary-darker-gray);
}
</style>
