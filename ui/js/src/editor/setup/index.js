import "regenerator-runtime/runtime";
import {keymap} from "prosemirror-keymap"
import {history} from "prosemirror-history"
import {baseKeymap} from "prosemirror-commands"
import {Plugin} from "prosemirror-state"
import {dropCursor} from "prosemirror-dropcursor"
import {gapCursor} from "prosemirror-gapcursor"



import {buildKeymap} from "./keymap"
import {buildInputRules} from "./inputrules"

import Placeholder from '../plugins/placeholder'
import MaxLength from '../plugins/max-length'

import {getMentionsPlugin} from '../plugins/mentions/index'

export {buildKeymap, buildInputRules}

// !! This module exports helper functions for deriving a set of basic
// menu items, input rules, or key bindings from a schema. These
// values need to know about the schema for two reasons—they need
// access to specific instances of node and mark types, and they need
// to know which of the node and mark types that they know about are
// actually present in the schema.
//
// The `exampleSetup` plugin ties these together into a plugin that
// will automatically enable this basic functionality in an editor.

// :: (Object) → [Plugin]
// A convenience plugin that bundles together a simple menu with basic
// key bindings, input rules, and styling for the example schema.
// Probably only useful for quickly setting up a passable
// editor—you'll need more control over your settings in most
// real-world situations.
//
//   options::- The following options are recognized:
//
//     schema:: Schema
//     The schema to generate key bindings and menu items for.
//
//     mapKeys:: ?Object
//     Can be used to [adjust](#example-setup.buildKeymap) the key bindings created.
//
//     menuBar:: ?bool
//     Set to false to disable the menu bar.
//
//     history:: ?bool
//     Set to false to disable the history plugin.
//
//     floatingMenu:: ?bool
//     Set to false to make the menu bar non-floating.
//
//     menuContent:: [[MenuItem]]
//     Can be used to override the menu content.
//

let noImage = () => {
  return `
    <div class="gr-default pointer">
     <svg class="gr-center" height="33" width="33">
       <circle cx="16.5" cy="16.5" r="16.5" stroke-width="0" fill="black" />
     </svg>
    </div>

  `
}


let image = (user) => {
  return `
    <div class="avatar-33 gr-center">
      <img loading="lazy"  src="https://${user.image}"/>
    </div>

  `
}

function buildItem(item) {
  return `
    <div class="flex gr-center">
      <div class="mr3 sug-av">
        ${item.image.length > 0 ? image(item) : noImage()}
      </div>
      <div class="flex gr-center">
        @${item.username}
      </div>
    </div>
  `
}

function mentionItem(item) {
  return `<div class="suggestion-item pv2 ph3">${buildItem(item)}</div>`
}


let getMentionSuggestionsHTML = items => `<div class="suggestion-item-list">${items.map(i => mentionItem(i)).join('')}</div>`;

var getTagSuggestionsHTML = items => '<div class="suggestion-item-list ">'+
  items.map(i => '<div class="suggestion-item pv2 ph3">#'+i.tag+'</div>').join('')+
'</div>';



async function fetchUsers(query){
    let data = {
      username: query,
    };
  let matches = await fetch(`/user/suggest`, {
      method: 'POST', // or 'PUT'
      body: JSON.stringify(data), // data can be `string` or {object}!
      headers:{
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    })
  const dmt = await matches.json()
  return Promise.resolve(dmt)
}

async function fetchTags(query){
    let data = {
      hashtag: query,
    };
  let matches = await fetch(`/hashtag/suggest`, {
      method: 'POST', // or 'PUT'
      body: JSON.stringify(data), // data can be `string` or {object}!
      headers:{
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    })
  const dmt = await matches.json()
  return Promise.resolve(dmt)
}


var mentionPlugin = getMentionsPlugin({
    getSuggestions: (type, text, done) => {
      setTimeout(() => {
        if (type === 'mention') {
            fetchUsers(text).then((res) => {
                console.log(res)
              if(res.items && res.items.length > 0) {
                let items = [];
                res.items.forEach(item => {
                  let x = {
                    username: item.username,
                    name: item.name,
                    image: item.image,
                    cool: item.cool,
                    type: item.type,
                  }
                  items.push(x)
                done(items)
                })
              }
            }).then(() => {
            })
        } else {
            fetchTags(text).then((res) => {
                console.log(res)
              if(res.tags && res.tags.length > 0) {
                //res.tags.unshift({tag: text})
                done(res.tags)
              }
            }).then(() => {
            })
        }
      }, 0);
    },
    getSuggestionsHTML: (items, type) =>  {
      if (type === 'mention') {
        return getMentionSuggestionsHTML(items)
      } else if (type === 'tag') {
        return getTagSuggestionsHTML(items)
      }
    }
});

let tooltip = new Plugin({
  view(editorView) { return new Tooltip(editorView) }
})

export function setup(options) {
  let plugins = [
    buildInputRules(options.schema),
    keymap(buildKeymap(options.schema, options.mapKeys)),
    keymap(baseKeymap),
    dropCursor(),
    gapCursor(),
    Placeholder(options.placeholder),
  ]


  /*
  if(!options.article) {
    plugins.push(MaxLength(options.maxLength))
  }
  */

  if(options.mention && options.mention.username.length > 0) {
  }
  if(!options.disableMentions) {
    plugins.unshift(mentionPlugin)
  }

  if (options.history !== false)
    plugins.push(history())

  let props = {
      attributes: {class: "editor-content"}
  }

  if(options.containerClass && options.containerClass.length > 0) {
    props.attributes = {class: options.containerClass}
  }

  if(options.article) {
    props = {
        attributes: {class: "article-editor"}
    }
  }

  return plugins.concat(new Plugin({
    props: props,
  }))
}
