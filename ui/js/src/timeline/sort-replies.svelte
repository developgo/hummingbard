<script>
let selected;
function sort() {
    if(selected == 'recent') {
        window.location.href = `${window.location.pathname}?sort=recent`
    } else if(selected == 'replies'){
        window.location.href = `${window.location.pathname}?sort=replies`
    } else{
        window.location.href = `${window.location.pathname}`
    }
}

$: params = new URLSearchParams(window.location.search)
$: paramsSort = params.get('sort')
$: recent = paramsSort == 'recent'
$: replies = paramsSort == 'replies'
</script>

<select class="small" bind:value={selected} on:change={sort}>
    <option value="oldest">Oldest</option>
    <option value="recent" selected={recent}>Recent</option>
    <option value="replies" selected={replies}>Most Replies</option>
</select>
