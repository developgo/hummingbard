<script>
import { fade } from 'svelte/transition'
import {onMount} from 'svelte'
let active = false;


onMount(() => {
  active = true
})

function kill() {

}
</script>


{#if active}
<div class="modal-container main ph3" transition:fade="{{duration: 33}}">

  <div class="modal-inner-np start flex flex-column " >

    <div class="pa3 flex flex-column">

      <div class="flex mt4">


        hello



      </div>

        <div class="flex mt4">

          <div class="">
          </div>

        </div>




    </div>


  </div>

  <div class="mask absolute" on:click={kill}></div>

</div>
{/if}


<style>
.modal-container {
    top: 0;
    left: 0;
    position: fixed;
    width: 100%;
    height: 100%;
    z-index: 49999;
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: auto;
}

.modal-inner-np {
    justify-self: center;
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: auto;
    z-index: 50000;

    background-color: var(--m-bg);
    -webkit-box-shadow: 0px 4px 24px -1px rgba(0,0,0,0.05);
    -moz-box-shadow: 0px 4px 24px -1px rgba(0,0,0,0.05);
    box-shadow: 0px 4px 24px -1px rgba(0,0,0,0.05);
    border-radius: 17px;
    transition: 0.1s;
    word-break: break-word;
}

.start {
    align-self: center;
    width: 680px;
}
@media screen and (max-width: 680px) {
  .start {
    width: 100%;
  }
}

.mask {
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background: var(--mask)
}



</style>

