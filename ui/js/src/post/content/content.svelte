<script>
import {makeid} from '../../utils/utils.js'
import ReadMore from './read-more/read-more.svelte'
export let post;
export let reply;

$: pid = makeid(8)

$: long = post.content.body.length > 666 &&
    !window?.timeline?.permalink

$: isArticle = post.is_article

$: title = post.content["com.hummingbard.article"]?.title

$: subtitle = post.content["com.hummingbard.article"]?.subtitle

$: description = post.content["com.hummingbard.article"]?.description

$: featuredImage = post.content["com.hummingbard.article"]?.featured_image

$: slug = post.content["com.hummingbard.article"]?.slug

$: articlePermalink = `${post.content.room_path}/${slug}`

</script>

{#if !isArticle}
<div class="post-content relative pt3 mb2" 
id="tl-{pid}"
class:long={long} 
class:fs-09={reply} 
class:pb3={long}>

    {@html post.content.bodyHTML}

    {#if long}
        <div class="gradient"
        id="gr-{pid}">
        </div>
        <div class="read-more">
            <ReadMore id={pid} />
        </div>
    {/if}

</div>
{:else}
    <div class="mt3 flex flex-column">
        <a href={articlePermalink}>

            {#if featuredImage}
              <div class="featured-image bg-img"
                  style="background-image:url({featuredImage.mxc});">
              </div>
            {/if}


            <div class="flex flex-coumn lh-copy brd">

                <div class="flex felx-column pa3">

                    <div class="">
                        <span class="f4 bold">{title}</span>
                    </div>

                </div>
            </div>
        </a>
    </div>
{/if}
