import {wrapItem, blockTypeItem, Dropdown, DropdownSubmenu, joinUpItem, liftItem,
       selectParentNodeItem, undoItem, redoItem, icons, MenuItem} from "./menu/menu"
import {NodeSelection, TextSelection} from "prosemirror-state"
import {toggleMark} from "prosemirror-commands"
import {wrapInList} from "prosemirror-schema-list"
import {TextField, openPrompt} from "./prompt"

// Helpers to create specific types of items

function canInsert(state, nodeType) {
  let $from = state.selection.$from
  for (let d = $from.depth; d >= 0; d--) {
    let index = $from.index(d)
    if ($from.node(d).canReplaceWith(index, index, nodeType)) return true
  }
  return false
}

function insertImageItem(nodeType) {
  return new MenuItem({
    title: "Insert image",
    icon: icons.image,
    enable(state) { return canInsert(state, nodeType) },
    run(state, _, view) {
      let {from, to} = state.selection, attrs = null
      if (state.selection instanceof NodeSelection && state.selection.node.type == nodeType)
        attrs = state.selection.node.attrs

      let aim = document.querySelector('#articleImage')
      if(aim) {
        aim.click()
        aim.addEventListener('change', (e) => {
          if(e.target.files.length > 0) {
            let file = e.target.files[0]
            if (file.size > 23000000) {
              alert("That image is too large.")
              return
            }

            var reader = new FileReader();
            reader.readAsDataURL(file);

              aim.value = null
            reader.onload = e => {
              const content = e.target.result;
              let item = {
                url: URL.createObjectURL(file),
                file: file,
              }

              let attrs = {
                src: item.url,
                file: file,
                title: "",
                alt: "",
              }


              let tr = view.state.tr.replaceSelectionWith(nodeType.create(attrs))
              let sel = state.selection.$from.pos
              view.dispatch(tr)
              view.focus()
            }

          }
        })
      }
      /*
      let href = prompt("Enter a full URL. (https://www.timecube.com)")
      if(href && href.length > 0) {
        const http = href.includes("http://");
        const https = href.includes("https://");
        if(!http && !https) {
            alert("Enter a full URL.")
        } else if(href) {
          let attrs = {
            src: href,
            title: "",
            alt: "",
          }
          //view.dispatch(view.state.tr.replaceSelectionWith(nodeType.createAndFill(attrs)))
          //

          let tr = view.state.tr.replaceSelectionWith(nodeType.create(attrs))
          let sel = state.selection.$head.pos
          tr = tr.insert(sel+1, view.state.schema.nodes.paragraph.createAndFill())
          tr.setSelection(new TextSelection(tr.doc.resolve(sel+2)))
          view.dispatch(tr)
          view.focus()
        }
      }
      */

    }
  })
}

function cmdItem(cmd, options) {
  let passedOptions = {
    label: options.title,
    run: cmd
  }
  for (let prop in options) passedOptions[prop] = options[prop]
  if ((!options.enable || options.enable === true) && !options.select)
    passedOptions[options.enable ? "enable" : "select"] = state => cmd(state)

  return new MenuItem(passedOptions)
}

function markActive(state, type) {
  let {from, $from, to, empty} = state.selection
  if (empty) return type.isInSet(state.storedMarks || $from.marks())
  else return state.doc.rangeHasMark(from, to, type)
}

function markItem(markType, options) {
  let passedOptions = {
    active(state) { return markActive(state, markType) },
    enable: true
  }
  for (let prop in options) passedOptions[prop] = options[prop]
  return cmdItem(toggleMark(markType), passedOptions)
}

function linkItem(markType) {
  return new MenuItem({
    title: "Add or remove link",
    icon: icons.link,
    active(state) { return markActive(state, markType) },
    enable(state) { return !state.selection.empty },
    run(state, dispatch, view) {
      if (markActive(state, markType)) {
        toggleMark(markType)(state, dispatch)
        return true
      }
      let href = prompt("Enter a full URL. (https://www.timecube.com)")
      if(href && href.length > 0) {
        const http = href.includes("http://");
        const https = href.includes("https://");
        if(!http && !https) {
            alert("Enter a full URL.")
        } else if(href) {
          toggleMark(markType, {href: href, title: `Link: ${href}`})(state, dispatch)
        }
      }
    }
  })
}

function wrapListItem(nodeType, options) {
  return cmdItem(wrapInList(nodeType, options.attrs), options)
}

// :: (Schema) → Object
// Given a schema, look for default mark and node types in it and
// return an object with relevant menu items relating to those marks:
//
// **`toggleStrong`**`: MenuItem`
//   : A menu item to toggle the [strong mark](#schema-basic.StrongMark).
//
// **`toggleEm`**`: MenuItem`
//   : A menu item to toggle the [emphasis mark](#schema-basic.EmMark).
//
// **`toggleCode`**`: MenuItem`
//   : A menu item to toggle the [code font mark](#schema-basic.CodeMark).
//
// **`toggleLink`**`: MenuItem`
//   : A menu item to toggle the [link mark](#schema-basic.LinkMark).
//
// **`insertImage`**`: MenuItem`
//   : A menu item to insert an [image](#schema-basic.Image).
//
// **`wrapBulletList`**`: MenuItem`
//   : A menu item to wrap the selection in a [bullet list](#schema-list.BulletList).
//
// **`wrapOrderedList`**`: MenuItem`
//   : A menu item to wrap the selection in an [ordered list](#schema-list.OrderedList).
//
// **`wrapBlockQuote`**`: MenuItem`
//   : A menu item to wrap the selection in a [block quote](#schema-basic.BlockQuote).
//
// **`makeParagraph`**`: MenuItem`
//   : A menu item to set the current textblock to be a normal
//     [paragraph](#schema-basic.Paragraph).
//
// **`makeCodeBlock`**`: MenuItem`
//   : A menu item to set the current textblock to be a
//     [code block](#schema-basic.CodeBlock).
//
// **`makeHead[N]`**`: MenuItem`
//   : Where _N_ is 1 to 6. Menu items to set the current textblock to
//     be a [heading](#schema-basic.Heading) of level _N_.
//
// **`insertHorizontalRule`**`: MenuItem`
//   : A menu item to insert a horizontal rule.
//
// The return value also contains some prefabricated menu elements and
// menus, that you can use instead of composing your own menu from
// scratch:
//
// **`insertMenu`**`: Dropdown`
//   : A dropdown containing the `insertImage` and
//     `insertHorizontalRule` items.
//
// **`typeMenu`**`: Dropdown`
//   : A dropdown containing the items for making the current
//     textblock a paragraph, code block, or heading.
//
// **`fullMenu`**`: [[MenuElement]]`
//   : An array of arrays of menu elements for use as the full menu
//     for, for example the [menu bar](https://github.com/prosemirror/prosemirror-menu#user-content-menubar).
export function buildMenuItems(schema) {
  let r = {}, type
  if (type = schema.marks.strong)
    r.toggleStrong = markItem(type, {title: "Toggle strong style", icon: icons.strong})
  if (type = schema.marks.em)
    r.toggleEm = markItem(type, {title: "Toggle emphasis", icon: icons.em})
  if (type = schema.marks.code)
    r.toggleCode = markItem(type, {title: "Toggle code font", icon: icons.code})
  if (type = schema.marks.link)
    r.toggleLink = linkItem(type)

  if (type = schema.nodes.image)
    r.insertImage = insertImageItem(type)
  if (type = schema.nodes.bullet_list)
    r.wrapBulletList = wrapListItem(type, {
      title: "Wrap in bullet list",
      icon: icons.bulletList
    })
  if (type = schema.nodes.ordered_list)
    r.wrapOrderedList = wrapListItem(type, {
      title: "Wrap in ordered list",
      icon: icons.orderedList
    })
  if (type = schema.nodes.blockquote)
    r.wrapBlockQuote = wrapItem(type, {
      title: "Wrap in block quote",
      icon: icons.blockquote
    })
  if (type = schema.nodes.heading)
    for (let i = 1; i <= 10; i++)
      r["makeHead" + i] = blockTypeItem(type, {
        title: "Change to heading " + i,
        label: "Level " + i,
        attrs: {level: i}
      })

  if (type = schema.nodes.horizontal_rule) {
    let hr = type
    r.insertHorizontalRule = new MenuItem({
      title: "Insert horizontal rule",
      label: "Horizontal rule",
      enable(state) { return canInsert(state, hr) },
      run(state, dispatch) { dispatch(state.tr.replaceSelectionWith(hr.create())) }
    })
  }

  let cut = arr => arr.filter(x => x)
  r.insertMenu = new Dropdown(cut([r.insertImage, r.insertHorizontalRule]), {label: "Insert"})
  r.typeMenu = new Dropdown(cut([r.makeParagraph, r.makeCodeBlock, r.makeHead1 && new DropdownSubmenu(cut([
    r.makeHead1, r.makeHead2, r.makeHead3, r.makeHead4, r.makeHead5, r.makeHead6
  ]), {label: "Heading"})]), {label: "Type..."})

  r.inlineMenu = [cut([r.toggleStrong, r.toggleEm, r.toggleCode, r.toggleLink])]
  r.blockMenu = [cut([r.wrapBulletList, r.wrapOrderedList, r.wrapBlockQuote, joinUpItem,
                      liftItem])]
  r.imageMenu = [cut([r.insertImage])]
  //r.fullMenu = r.inlineMenu.concat(r.insertMenu, r.blockMenu, r.imageMenu)
  r.fullMenu = r.inlineMenu.concat(r.insertMenu, r.blockMenu)

  return r
}
