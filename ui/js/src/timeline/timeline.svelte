<script>
import {onMount} from 'svelte'
import { initializePosts } from './store.js'

onMount(() => {
    initializePosts()
})
</script>

