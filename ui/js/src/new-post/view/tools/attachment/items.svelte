<script>
export let store;
import AttachmentItem from './attachment-item.svelte'

</script>

<div class="attachment-items flex flex-column mb3 pa3">
    {#each store?.attachments as attachment (attachment.id)}
        <AttachmentItem 
        on:deleteAttachment
        on:updateAttachmentURL
        attachment={attachment}/>
    {/each}
</div>



<style>
.attachment-items {
    border-radius: 13px;
    border: 1px solid var(--primary-light-gray);
}

</style>
