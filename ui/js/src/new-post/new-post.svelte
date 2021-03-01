<script>
import {onMount, onDestroy, createEventDispatcher} from 'svelte'

import { addedPosts } from '../timeline/store.js'

import { post } from './store.js'

let active = false;


function activate() {
  post.activate()
}

function discard() {
  post.kill()
}

$: active = $post.active

$: text = window?.timeline?.permalink ? `Reply` : `New Post`


</script>

{#if !active}
  <div class="flex flex-one">
    <div class="flex-one"></div>
    <div class="">
      <button class="" on:click={activate}>{text}</button>
    </div>
  </div>
{/if}
