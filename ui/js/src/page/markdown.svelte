<script>
import marked from 'marked'

export let content = ``;

$: text = content?.length > 0 ? content : `Preview`

$: render = marked(text)

</script>

<div class="lh-copy page">
    {@html render}
</div>

<style>
.md {
}
p {
    margin: 0;
}
</style>
