<script>
export let image;
export let reply;
$: imgSrc = `${homeserverURL}/_matrix/media/r0/download/${image.mxc}`
</script>

{#if !reply}
<div class="gr-center w-100">
    <div class="pi-c relative"
      style="padding-bottom:{image.aspect_ratio}%;">
      <a href={imgSrc}>
          <img loading="lazy" src={imgSrc} />
      </a>
    </div>
</div>
{:else}
<div class="gr-center mr3">
  <a href={imgSrc}>
    <div class="pi-c-a" style="background-image: url({imgSrc});">
    </div>
  </a>
</div>
{/if}
