<script>
import {createEventDispatcher} from 'svelte'
const dispatch = createEventDispatcher();

export let store;

import { tick } from 'svelte';
import {editorState} from '../../../../editor/store.js'


$: isArticle = store?.article.enabled


async function toggle() {

    if(store?.article?.settings?.active) {
        dispatch('killArticleSettings')
        setTimeout(() =>{
            reset()
        }, 300)
        return
    } else {
        if(!store?.article.enabled) {
            dispatch('toggleArticleOn')
            if(store?.article?.title?.length > 0) {
                focusEditor()
            }
            return
        } else {
            dispatch('toggleArticleOff')
            focusEditor()
        }
    }
}

async function reset() {
    dispatch('killArticleSettings')

    let active = await dispatch('killArticleSettings')
    if(!active) {
        await tick();
        dispatch('toggleArticleOff')
        focusEditor()
    }
}

async function focusEditor() {
    await tick();
    editorState.focus()
}

</script>

<div class="gr-center" class:ml3={!isArticle}>
    <button class="small" on:click={toggle}>{isArticle ? '🡨 Quick Post' : 'Article'}</button>
</div>
