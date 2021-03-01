<script>

let active = false;

function toggle() {
  active = !active
}

</script>

<div class="md">
  <div class="relative">
    <div class="o-70" on:click={toggle}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm6.5-.25A.75.75 0 017.25 7h1a.75.75 0 01.75.75v2.75h.25a.75.75 0 010 1.5h-2a.75.75 0 010-1.5h.25v-2h-.25a.75.75 0 01-.75-.75zM8 6a1 1 0 100-2 1 1 0 000 2z"></path></svg>
    </div>
  </div>

  {#if active}
    <div class="info pa3">
      TODO: Markdown shortcuts here
    </div>
  {/if}

</div>


<style>
.md {
  position: fixed;
  top: 1rem;
  right: 1rem;
  cursor: pointer;
}
.info {
  position: absolute;
  top: 1.5rem;
  right: 0;
  cursor: pointer;
  min-width: 350px;
  border-radius: 13px;
  border: 1px solid var(--primary-grayish);
}
</style>
