<script>
import { createEventDispatcher } from 'svelte';
const dispatch = createEventDispatcher();

import {makeid} from '../../../../utils/utils.js'

export let store;



function add() {
    let href = prompt("Enter a full URL. (https://www.timecube.com)")
    if(href != null && href.length > 0) {

    const http = href.includes("http://");
    const https = href.includes("https://");
    if(!http && !https) {
        alert("Enter a full URL.")
        add()
        return
    }

    let expression = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/g
    let regex = new RegExp(expression);

    let matches = href.match(regex);
    if(matches && matches.length > 0) {
        for(let i=0;i<matches.length; i++) {
            if(i == 9) {
                break
            }

            let item = {
                id: makeid(12),
                href: matches[i],
                metadata: {
                    title: null,
                    description: null,
                    author: null,
                    image: null,
                    domain: null,
                },
                data: null,
            }

            dispatch('addLink', item)

        }
    }


    }

}


</script>

<div class="pointer o-70 hov-op" class:fill-blue={store.links?.length > 0} 
  aria-label="Add Link"
  data-microtip-position="bottom"
  data-microtip-size="fit"
  role="tooltip"
    on:click={add}>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z"></path></svg>
</div>
