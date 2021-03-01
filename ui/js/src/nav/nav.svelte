<script>
import {fade} from 'svelte/transition'
import {onMount} from 'svelte'

let active = false;

onMount(() => {
    /*
    let n = localStorage.getItem("nav");
    if(n && n == 'true') {
        active = true
        let el = document.querySelector('.nav-de')
        if(el) {
            el.classList.add('nav-de-ac')
        }
    }
    */
})

function toggle() {
    active = !active
    if(active) {
        let el = document.querySelector('.nav-de')
        if(el) {
            el.classList.add('nav-de-ac')
        }
    } else {
        let el = document.querySelector('.nav-de')
        if(el) {
            el.classList.remove('nav-de-ac')
        }
    }
    localStorage.setItem("nav", active);
}

function alias(alias) {
    let x = alias.substring(1)
    x = x.replace(`:${window.location.hostname}`, "")
    x = x.replaceAll("_", "/")
    return x
}
let joined_rooms;
if(identity?.joined_rooms) {
    joined_rooms = identity?.joined_rooms;
    joined_rooms?.sort((a, b) => (a.room_alias > b.room_alias) ? 1 : -1)
}
</script>

<div class="n flex flex-column">

    <div class="hg gr-default pointer" 
         style="min-height: 56px;" 
              aria-label="Open Sidebar"
              data-microtip-position="right"
              data-microtip-size="fit"
              role="tooltip"
        on:click={toggle}>
        <div class="gr-center pv3" >
            <svg class="hgg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M1 2.75A.75.75 0 011.75 2h12.5a.75.75 0 110 1.5H1.75A.75.75 0 011 2.75zm0 5A.75.75 0 011.75 7h12.5a.75.75 0 110 1.5H1.75A.75.75 0 011 7.75zM1.75 12a.75.75 0 100 1.5h12.5a.75.75 0 100-1.5H1.75z"></path></svg>
        </div>
    </div>

</div>

{#if active}
    <div class="nav flex flex-column"
    transition:fade="{{duration: 53}}">

        <div class="flex fl-o pa3">

            <div class="gr-center">
            </div>

            <div class="flex-one"></div>

            <div class="gr-default pointer" on:click={toggle}>
                <div class="gr-center ">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill-rule="evenodd" d="M15.28 5.22a.75.75 0 00-1.06 0l-6.25 6.25a.75.75 0 000 1.06l6.25 6.25a.75.75 0 101.06-1.06L9.56 12l5.72-5.72a.75.75 0 000-1.06z"></path></svg>
                </div>
            </div>

        </div>




        <div class="n-contain h-100 flex flex-column scr pa3">
            <div class="">
                <span class="bold small">Joined Spaces</span>
            </div>
            <div class="mt3">
                    <div class="mb3 mr2">
                        <a href="/public">
                            <span class="primary fs-09">Public Feed</span>
                        </a>
                    </div>
                {#each joined_rooms as room (room.room_id)}
                    <div class="mb2 mr2">
                        <a href="/{alias(room.room_alias)}">
                            <span class="primary fs-09">{alias(room.room_alias)}</span>
                        </a>
                    </div>
                {/each}
            </div>
        </div>

    </div>
{/if}

<style>
.n {
    width: 100%;
    position: sticky;
    top: 0;
    height: 100vh;
}
.n-itm {
}
.nav {
  position :fixed;
  width: 300px;
  background: var(--primary-light-gray);
  top: 0;
  bottom: 0;
  left: 0;
}

.n-contain {
    overflow-x: auto;
}


.scr  {
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--primary-gray) var(--primary-light-gray);
}

.scr::-webkit-scrollbar {
  width: 6px;
}
.scr::-webkit-scrollbar-track {
  background: var(--primary-light-gray);
}
.scr::-webkit-scrollbar-thumb {
  background-color: var(--primary-gray);
}

    .hg:hover .hgg{
        stroke-width: 3;
        fill: blue;
    }

@media screen and (max-width: 768px) {
    .n {
        width: 2rem;
    }
}


</style>
