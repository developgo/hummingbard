<script>
import { createEventDispatcher } from 'svelte';
const dispatch = createEventDispatcher();

export let store;

import {makeid} from '../../../../utils/utils.js'
let attachmentInput;

let files = [];
let count = 0;




function add() {
    if(store?.attachments?.length >= 14) {
        return
    }
    attachmentInput.click()
}


let build = (e) => {
    if(count + e.target.files.length > 14) {
        alert("That's too attachments for one post.")
        return
    }
    for(let i =0 ; i < e.target.files.length ; i++) {

        if(e.target.files.length > 14) {
            alert("That's too many attachments for one post.")
            break
        }

        const file = e.target.files[i]

        if (e.target.files[i].size > 23000000) {
            alert("That file is too large.")
            continue
        }
        files = [...files, e.target.files[i]]



    }

    count += files.length


    for(let i =0 ; i < files.length; i++) {

        var reader = new FileReader();
        const file = files[i]
        reader.readAsDataURL(file);

        reader.onload = e => {
          const content = e.target.result;

          let item = {
              index: i,
              id: `attachment-${makeid(12)}`,
              file: file,
              uploaded: false,
          }


        dispatch('addAttachment', item)
          attachmentInput.value = ''
        }
    }

    files = []

}



</script>

<input 
    type="file" 
    name="attachments"
    bind:this={attachmentInput} 
    on:change={build} 
    hidden 
    multiple
>
<div class="pointer o-70 hov-op" class:fill-blue={store?.attachments?.length > 0} 
  aria-label="Add Attachment"
  data-microtip-position="bottom"
  data-microtip-size="fit"
  role="tooltip"
    on:click={add}>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16">
<path d="M10.404 5.11l-1.015-1.014-5.075 5.074c-0.841 0.841-0.841 2.204 0 3.044s2.204 0.841 3.045 0l6.090-6.089c1.402-1.401 1.402-3.673 0-5.074s-3.674-1.402-5.075 0l-6.394 6.393c-0.005 0.005-0.010 0.009-0.014 0.013-1.955 1.955-1.955 5.123 0 7.077s5.123 1.954 7.078 0c0.004-0.004 0.008-0.009 0.013-0.014l0.001 0.001 4.365-4.364-1.015-1.014-4.365 4.363c-0.005 0.004-0.009 0.009-0.013 0.013-1.392 1.392-3.656 1.392-5.048 0s-1.392-3.655 0-5.047c0.005-0.005 0.009-0.009 0.014-0.013l-0.001-0.001 6.395-6.393c0.839-0.84 2.205-0.84 3.045 0s0.839 2.205 0 3.044l-6.090 6.089c-0.28 0.28-0.735 0.28-1.015 0s-0.28-0.735 0-1.014l5.075-5.075z"></path>
</svg>

</div>
