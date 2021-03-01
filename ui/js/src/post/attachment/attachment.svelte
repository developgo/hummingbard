<script>
import { formatBytes  } from '../../utils/utils.js'
export let attachment;
export let single;

$: src = `${homeserverURL}/_matrix/media/r0/download/${attachment.mxc}`

$: size = formatBytes(attachment.size)

</script>


<div class="attachment-item flex flex-column" class:mb3={!single}>
    <div class="fs-09 flex-one">
      <a href={src}>
        <span class="primary">{attachment.filename}</span>
      </a>
    </div>
    <div class="mt1 small o-90">
      {attachment.mimetype} - {size}
    </div>
</div>


