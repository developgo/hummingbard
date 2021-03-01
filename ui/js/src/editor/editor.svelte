<script>
import { onMount, onDestroy, createEventDispatcher } from 'svelte'
const dispatch = createEventDispatcher()
import { randomPlaceholder } from './plugins/placeholder.js'

import {content, editorState} from './store.js'


import {EditorState, TextSelection, Selection} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {Schema, DOMParser, DOMSerializer, Node} from "prosemirror-model"
import {schema} from "./schema/schema.js"
import {articleSchema} from "./schema/articleSchema.js"
import {addListNodes} from "prosemirror-schema-list"
import {setup} from './setup/index.js'
import {addMentionNodes, addTagNodes } from './plugins/mentions/index.js'
import { makeid } from '../utils/utils.js'

let state;
let view;
let container;
let another;

export let containerClass = "editor-content";
let contain = `contain-${makeid(12)}`

$: focused = view && view.focused

$: if(view && $editorState.focused) {
    view.focus()
}

$: if(placeholder && view) {
    let el = document.querySelector('.placeholder')
    if(el && el.dataset.placeholder && el.dataset.placeholder.length > 0) {
        if(el.dataset.placeholder != placeholder) {
            el.dataset.placeholder = placeholder
        }
    }
}

$: if(placeholder == null || placeholder == undefined) {
    placeholder = randomPlaceholder()
}


export let placeholder = randomPlaceholder()
export let maxLength = 8000;
export let disableMentions = false;
export let mention;
export let initial;
export let article = false;
export let editing = false;
export let fullHeight = false;


$: editorIsEmpty = state ? state.doc.content.size === 0
    || (state.doc.textContent === "" && state.doc.content.size < 3) : true


function getHTML(state, schema) {
    const div = document.createElement('div')
    const fragment = DOMSerializer
        .fromSchema(schema)
        .serializeFragment(state.doc.content)
    div.appendChild(fragment)

    return div.innerHTML
}

function getMentions() {
    let el = document.querySelector(`.${containerClass}`)
    let mel = el.querySelectorAll('.mention')
    if(!mel) {
        return []
    }
    let mentions = [];
    mel.forEach(mention => {
        let item = {
            username: mention.dataset.username,
        }
        mentions.push(item)
    })
    return mentions
}
 
function getHashtags() {
    let el = document.querySelector(`.${containerClass}`)
    let mel = el.querySelectorAll('.hashtag')
    let sug = el.querySelectorAll('.suggestion')
    if(!mel) {
        return []
    }
    let tags = [];
    mel.forEach(tag => {
        let ind = tags.findIndex(x => x === tag)
        tags.push(tag.dataset.hashtag)
    })
    return tags
}

let _content = {
    html: null,
    plain_text: null,
    length: 0,
};

export function getContent() {
    updateContent(state)
    return _content
}

export function focus() {
    view.focus()
}

let updateContent = (state) => {

    _content = {
        plain_text: document.querySelector(`.${containerClass}`).innerText,
        length: state.doc.textContent.length,
    }

    let html = document.querySelector(`.${containerClass}`).innerHTML
    let plc = document.querySelector(`.${containerClass}`).querySelector('.placeholder')
    if(plc) {
        return
    }
    //let html = getHTML(state, state.doc.type.schema)
    let div = document.createElement("div");
    div.innerHTML = html
    _content.html = div.innerHTML

    /*
    let expression = /([^"]|(?<!\\)\\")(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/gi
    let result = _content.html.replace(expression, (item) => {
        return `<a href="${item}">${item}</a>`
    });
    _content.html = result
    */

    content.sync(_content)
}

let countMe = () => {
    return maxLength - length
}

$: countDiff = countMe(length)

 
onMount(() => {

    let nodes = schema.spec.nodes

    /*
    if(article) {
        nodes = addListNodes(articleSchema.spec.nodes,  "paragraph block*", "block")
    }
    */

    if(!disableMentions) {
        nodes = addTagNodes(addMentionNodes(nodes))
    }

    let schm = {
        nodes: nodes,
        marks: schema.spec.marks
    }

    if(article) {
        schm.marks = articleSchema.spec.marks
    }
    const mySchema = new Schema(schm)

    let doc =  DOMParser.fromSchema(mySchema).parse(document.querySelector("#econtent"))
    if(initial) {
        let init = document.createElement("div");
        init.innerHTML = initial

        doc =  DOMParser.fromSchema(mySchema).parse(init)
        if(editing) {
            console.log("editing a post")
            let init = document.createElement("div");
            init.innerText = initial
            doc =  DOMParser.fromSchema(mySchema).parse(init)
        }
    }

    let stateOptions = {
        doc: doc,
        plugins: setup({
            schema: mySchema, 
            placeholder: placeholder, 
            maxLength: maxLength,
            disableMentions: disableMentions,
            mention: mention,
            containerClass: containerClass,
            article: article,
        })
    }



    state = EditorState.create(stateOptions)

    view = new EditorView(document.querySelector(`#${contain}`), {
        state: state,
        dispatchTransaction: (transaction) => {

            state = view.state.apply(transaction)
            view.updateState(state)


            updateContent(state)
            dispatch('sync', _content)

            state.tr.doc.descendants((node, pos, parent) => {
                if(node.isTextblock) {
                    let expression = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/g
                    let regex = new RegExp(expression);
             
                    let matches = node.textContent.match(regex);
                    if(matches && matches.length > 0) {
                        /*
                        for(let i=0;i<matches.length; i++) {
                            console.log(matches[i])
                        }
                        */
                    }
                }
            })
        }
    })


    // if there's an initial mention, we want the caret to move 
    if(mention && mention.username) {
        let attrs = {
          username: mention.username,
        };

        var node = view.state.schema.nodes["mention"].create(attrs)
        let from = view.state.selection.from
        let to = view.state.selection.to
        var tr = view.state.tr.replaceWith(from, to, node);
        tr = tr.insertText(" ")
        state = view.state.apply(tr);
        view.updateState(state);

        dispatch('sync', true)

    }

    if(initial) {
        const selection = Selection.atEnd(view.docView.node)
        const tr = view.state.tr.setSelection(selection)
        const state = view.state.apply(tr)
        view.updateState(state)
    }

    view.focus()
    setTimeout(() => {
        view.focus()
    }, 10)

    editorState.focus()

    dispatch('ready', true)
    dispatch('sync', true)

    /*
    let attrs={ title: 'mylink', href:'google.com' }
    let nod=mySchema.text(attrs.title, [mySchema.marks.link.create(attrs)])
    view.dispatch(view.state.tr.replaceSelectionWith(nod, false))
    */
})

onDestroy(() => {
    view.destroy()
})



$: progress = ((length / maxLength) * 100) / 2

$: if(article) {
    let el = document.querySelector('.editor-content')
    if(el) {
        el.classList.add('e-pad')
    } 
} else {
    let el = document.querySelector('.editor-content')
    if(el) {
        el.classList.remove('e-pad')
    } 
}

</script>


<div class="w-100" class:h-100={fullHeight} bind:this={container} id={contain}></div>


<div class="dis-n" id="econtent"></div>

<style>
#contain {
    height:100%;
}


.e-pad {
    --minus: calc(100% - 720px);
    --bytwo: calc(var(--minus) / 2);
    padding-left: var(--bytwo);
    padding-right: var(--bytwo);
}



</style>

