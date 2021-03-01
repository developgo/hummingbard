import crel from "crelt"
import {lift, joinUp, selectParentNode, wrapIn, setBlockType} from "prosemirror-commands"
import {undo, redo} from "prosemirror-history"

import {getIcon} from "./icons"

const prefix = "ProseMirror-menu"

// ::- An icon or label that, when clicked, executes a command.
export class MenuItem {
  // :: (MenuItemSpec)
  constructor(spec) {
    // :: MenuItemSpec
    // The spec used to create the menu item.
    this.spec = spec
  }

  // :: (EditorView) → {dom: dom.Node, update: (EditorState) → bool}
  // Renders the icon according to its [display
  // spec](#menu.MenuItemSpec.display), and adds an event handler which
  // executes the command when the representation is clicked.
  render(view) {
    let spec = this.spec
    let dom = spec.render ? spec.render(view)
        : spec.icon ? getIcon(spec.icon)
        : spec.label ? crel("div", null, translate(view, spec.label))
        : null
    if (!dom) throw new RangeError("MenuItem without icon or label property")
    if (spec.title) {
      const title = (typeof spec.title === "function" ? spec.title(view.state) : spec.title)
      dom.setAttribute("title", translate(view, title))
    }
    if (spec.class) dom.classList.add(spec.class)
    if (spec.css) dom.style.cssText += spec.css

    dom.addEventListener("mousedown", e => {
      e.preventDefault()
      if (!dom.classList.contains(prefix + "-disabled"))
        spec.run(view.state, view.dispatch, view, e)
    })

    function update(state) {
      if (spec.select) {
        let selected = spec.select(state)
        dom.style.display = selected ? "" : "none"
        if (!selected) return false
      }
      let enabled = true
      if (spec.enable) {
        enabled = spec.enable(state) || false
        setClass(dom, prefix + "-disabled", !enabled)
      }
      if (spec.active) {
        let active = enabled && spec.active(state) || false
        setClass(dom, prefix + "-active", active)
      }
      return true
    }

    return {dom, update}
  }
}

function translate(view, text) {
  return view._props.translate ? view._props.translate(text) : text
}

// MenuItemSpec:: interface
// The configuration object passed to the `MenuItem` constructor.
//
//   run:: (EditorState, (Transaction), EditorView, dom.Event)
//   The function to execute when the menu item is activated.
//
//   select:: ?(EditorState) → bool
//   Optional function that is used to determine whether the item is
//   appropriate at the moment. Deselected items will be hidden.
//
//   enable:: ?(EditorState) → bool
//   Function that is used to determine if the item is enabled. If
//   given and returning false, the item will be given a disabled
//   styling.
//
//   active:: ?(EditorState) → bool
//   A predicate function to determine whether the item is 'active' (for
//   example, the item for toggling the strong mark might be active then
//   the cursor is in strong text).
//
//   render:: ?(EditorView) → dom.Node
//   A function that renders the item. You must provide either this,
//   [`icon`](#menu.MenuItemSpec.icon), or [`label`](#MenuItemSpec.label).
//
//   icon:: ?Object
//   Describes an icon to show for this item. The object may specify
//   an SVG icon, in which case its `path` property should be an [SVG
//   path
//   spec](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d),
//   and `width` and `height` should provide the viewbox in which that
//   path exists. Alternatively, it may have a `text` property
//   specifying a string of text that makes up the icon, with an
//   optional `css` property giving additional CSS styling for the
//   text. _Or_ it may contain `dom` property containing a DOM node.
//
//   label:: ?string
//   Makes the item show up as a text label. Mostly useful for items
//   wrapped in a [drop-down](#menu.Dropdown) or similar menu. The object
//   should have a `label` property providing the text to display.
//
//   title:: ?union<string, (EditorState) → string>
//   Defines DOM title (mouseover) text for the item.
//
//   class:: ?string
//   Optionally adds a CSS class to the item's DOM representation.
//
//   css:: ?string
//   Optionally adds a string of inline CSS to the item's DOM
//   representation.

let lastMenuEvent = {time: 0, node: null}
function markMenuEvent(e) {
  lastMenuEvent.time = Date.now()
  lastMenuEvent.node = e.target
}
function isMenuEvent(wrapper) {
  return Date.now() - 100 < lastMenuEvent.time &&
    lastMenuEvent.node && wrapper.contains(lastMenuEvent.node)
}

// ::- A drop-down menu, displayed as a label with a downwards-pointing
// triangle to the right of it.
export class Dropdown {
  // :: ([MenuElement], ?Object)
  // Create a dropdown wrapping the elements. Options may include
  // the following properties:
  //
  // **`label`**`: string`
  //   : The label to show on the drop-down control.
  //
  // **`title`**`: string`
  //   : Sets the
  //     [`title`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/title)
  //     attribute given to the menu control.
  //
  // **`class`**`: string`
  //   : When given, adds an extra CSS class to the menu control.
  //
  // **`css`**`: string`
  //   : When given, adds an extra set of CSS styles to the menu control.
  constructor(content, options) {
    this.options = options || {}
    this.content = Array.isArray(content) ? content : [content]
  }

  // :: (EditorView) → {dom: dom.Node, update: (EditorState)}
  // Render the dropdown menu and sub-items.
  render(view) {
    let content = renderDropdownItems(this.content, view)

    let label = crel("div", {class: prefix + "-dropdown " + (this.options.class || ""),
                             style: this.options.css},
                     translate(view, this.options.label))
    if (this.options.title) label.setAttribute("title", translate(view, this.options.title))
    let wrap = crel("div", {class: prefix + "-dropdown-wrap"}, label)
    let open = null, listeningOnClose = null
    let close = () => {
      if (open && open.close()) {
        open = null
        window.removeEventListener("mousedown", listeningOnClose)
      }
    }
    label.addEventListener("mousedown", e => {
      e.preventDefault()
      markMenuEvent(e)
      if (open) {
        close()
      } else {
        open = this.expand(wrap, content.dom)
        window.addEventListener("mousedown", listeningOnClose = () => {
          if (!isMenuEvent(wrap)) close()
        })
      }
    })

    function update(state) {
      let inner = content.update(state)
      wrap.style.display = inner ? "" : "none"
      return inner
    }

    return {dom: wrap, update}
  }

  expand(dom, items) {
    let menuDOM = crel("div", {class: prefix + "-dropdown-menu " + (this.options.class || "")}, items)

    let done = false
    function close() {
      if (done) return
      done = true
      dom.removeChild(menuDOM)
      return true
    }
    dom.appendChild(menuDOM)
    return {close, node: menuDOM}
  }
}

function renderDropdownItems(items, view) {
  let rendered = [], updates = []
  for (let i = 0; i < items.length; i++) {
    let {dom, update} = items[i].render(view)
    rendered.push(crel("div", {class: prefix + "-dropdown-item"}, dom))
    updates.push(update)
  }
  return {dom: rendered, update: combineUpdates(updates, rendered)}
}

function combineUpdates(updates, nodes) {
  return state => {
    let something = false
    for (let i = 0; i < updates.length; i++) {
      let up = updates[i](state)
      nodes[i].style.display = up ? "" : "none"
      if (up) something = true
    }
    return something
  }
}

// ::- Represents a submenu wrapping a group of elements that start
// hidden and expand to the right when hovered over or tapped.
export class DropdownSubmenu {
  // :: ([MenuElement], ?Object)
  // Creates a submenu for the given group of menu elements. The
  // following options are recognized:
  //
  // **`label`**`: string`
  //   : The label to show on the submenu.
  constructor(content, options) {
    this.options = options || {}
    this.content = Array.isArray(content) ? content : [content]
  }

  // :: (EditorView) → {dom: dom.Node, update: (EditorState) → bool}
  // Renders the submenu.
  render(view) {
    let items = renderDropdownItems(this.content, view)

    let label = crel("div", {class: prefix + "-submenu-label"}, translate(view, this.options.label))
    let wrap = crel("div", {class: prefix + "-submenu-wrap"}, label,
                   crel("div", {class: prefix + "-submenu"}, items.dom))
    let listeningOnClose = null
    label.addEventListener("mousedown", e => {
      e.preventDefault()
      markMenuEvent(e)
      setClass(wrap, prefix + "-submenu-wrap-active")
      if (!listeningOnClose)
        window.addEventListener("mousedown", listeningOnClose = () => {
          if (!isMenuEvent(wrap)) {
            wrap.classList.remove(prefix + "-submenu-wrap-active")
            window.removeEventListener("mousedown", listeningOnClose)
            listeningOnClose = null
          }
        })
    })

    function update(state) {
      let inner = items.update(state)
      wrap.style.display = inner ? "" : "none"
      return inner
    }
    return {dom: wrap, update}
  }
}

// :: (EditorView, [union<MenuElement, [MenuElement]>]) → {dom: ?dom.DocumentFragment, update: (EditorState) → bool}
// Render the given, possibly nested, array of menu elements into a
// document fragment, placing separators between them (and ensuring no
// superfluous separators appear when some of the groups turn out to
// be empty).
export function renderGrouped(view, content) {
  let result = document.createDocumentFragment()
  let updates = [], separators = []
  for (let i = 0; i < content.length; i++) {
    let items = content[i], localUpdates = [], localNodes = []
    for (let j = 0; j < items.length; j++) {
      let {dom, update} = items[j].render(view)
      let span = crel("span", {class: prefix + "item"}, dom)
      result.appendChild(span)
      localNodes.push(span)
      localUpdates.push(update)
    }
    if (localUpdates.length) {
      updates.push(combineUpdates(localUpdates, localNodes))
      if (i < content.length - 1)
        separators.push(result.appendChild(separator()))
    }
  }

  function update(state) {
    let something = false, needSep = false
    for (let i = 0; i < updates.length; i++) {
      let hasContent = updates[i](state)
      if (i) separators[i - 1].style.display = needSep && hasContent ? "" : "none"
      needSep = hasContent
      if (hasContent) something = true
    }
    return something
  }
  return {dom: result, update}
}

function separator() {
  return crel("span", {class: prefix + "separator"})
}

// :: Object
// A set of basic editor-related icons. Contains the properties
// `join`, `lift`, `selectParentNode`, `undo`, `redo`, `strong`, `em`,
// `code`, `link`, `bulletList`, `orderedList`, and `blockquote`, each
// holding an object that can be used as the `icon` option to
// `MenuItem`.
export const icons = {
  join: {
    width: 24, height: 24,
    path: "M12.354 8.854l5.792 5.792a.5.5 0 01-.353.854H6.207a.5.5 0 01-.353-.854l5.792-5.792a.5.5 0 01.708 0z"
  },
  lift: {
    width: 24, height: 24,
    path: "M8.854 11.646l5.792-5.792a.5.5 0 01.854.353v11.586a.5.5 0 01-.854.353l-5.792-5.792a.5.5 0 010-.708z"
  },
  selectParentNode: {text: "\u2b1a", css: "font-weight: bold"},
  undo: {
    width: 1024, height: 1024,
    path: "M761 1024c113-206 132-520-313-509v253l-384-384 384-384v248c534-13 594 472 313 775z"
  },
  redo: {
    width: 1024, height: 1024,
    path: "M576 248v-248l384 384-384 384v-253c-446-10-427 303-313 509-280-303-221-789 313-775z"
  },
  strong: {
    width: 24, height: 24,
    path: "M6 4.75c0-.69.56-1.25 1.25-1.25h5a4.75 4.75 0 013.888 7.479A5 5 0 0114 20.5H7.25c-.69 0-1.25-.56-1.25-1.25V4.75zM8.5 13v5H14a2.5 2.5 0 000-5H8.5zm0-2.5h3.751A2.25 2.25 0 0012.25 6H8.5v4.5z"
  },
  em: {
    width: 24, height: 24,
    path: "M10 4.75a.75.75 0 01.75-.75h8.5a.75.75 0 010 1.5h-3.514l-5.828 13h3.342a.75.75 0 010 1.5h-8.5a.75.75 0 010-1.5h3.514l5.828-13H10.75a.75.75 0 01-.75-.75z"
  },
  code: {
    width: 24, height: 24,
    path: "M8.78 4.97a.75.75 0 010 1.06L2.81 12l5.97 5.97a.75.75 0 11-1.06 1.06l-6.5-6.5a.75.75 0 010-1.06l6.5-6.5a.75.75 0 011.06 0zm6.44 0a.75.75 0 000 1.06L21.19 12l-5.97 5.97a.75.75 0 101.06 1.06l6.5-6.5a.75.75 0 000-1.06l-6.5-6.5a.75.75 0 00-1.06 0z"
  },
  link: {
    width: 24, height: 24,
    path: "M14.78 3.653a3.936 3.936 0 115.567 5.567l-3.627 3.627a3.936 3.936 0 01-5.88-.353.75.75 0 00-1.18.928 5.436 5.436 0 008.12.486l3.628-3.628a5.436 5.436 0 10-7.688-7.688l-3 3a.75.75 0 001.06 1.061l3-3z M7.28 11.153a3.936 3.936 0 015.88.353.75.75 0 001.18-.928 5.436 5.436 0 00-8.12-.486L2.592 13.72a5.436 5.436 0 107.688 7.688l3-3a.75.75 0 10-1.06-1.06l-3 3a3.936 3.936 0 01-5.567-5.568l3.627-3.627z"
  },
  bulletList: {
    width: 24, height: 24,
    path: "M4 7a1 1 0 100-2 1 1 0 000 2zm4.75-1.5a.75.75 0 000 1.5h11.5a.75.75 0 000-1.5H8.75zm0 6a.75.75 0 000 1.5h11.5a.75.75 0 000-1.5H8.75zm0 6a.75.75 0 000 1.5h11.5a.75.75 0 000-1.5H8.75zM5 12a1 1 0 11-2 0 1 1 0 012 0zm-1 7a1 1 0 100-2 1 1 0 000 2z"
  },
  orderedList: {
    width: 24, height: 24,
    path: "M3.604 3.089A.75.75 0 014 3.75V8.5h.75a.75.75 0 010 1.5h-3a.75.75 0 110-1.5h.75V5.151l-.334.223a.75.75 0 01-.832-1.248l1.5-1a.75.75 0 01.77-.037zM8.75 5.5a.75.75 0 000 1.5h11.5a.75.75 0 000-1.5H8.75zm0 6a.75.75 0 000 1.5h11.5a.75.75 0 000-1.5H8.75zm0 6a.75.75 0 000 1.5h11.5a.75.75 0 000-1.5H8.75zM5.5 15.75c0-.704-.271-1.286-.72-1.686a2.302 2.302 0 00-1.53-.564c-.535 0-1.094.178-1.53.565-.449.399-.72.982-.72 1.685a.75.75 0 001.5 0c0-.296.104-.464.217-.564A.805.805 0 013.25 15c.215 0 .406.072.533.185.113.101.217.268.217.565 0 .332-.069.48-.21.657-.092.113-.216.24-.403.419l-.147.14c-.152.144-.33.313-.52.504l-1.5 1.5a.75.75 0 00-.22.53v.25c0 .414.336.75.75.75H5A.75.75 0 005 19H3.31l.47-.47c.176-.176.333-.324.48-.465l.165-.156a5.98 5.98 0 00.536-.566c.358-.447.539-.925.539-1.593z"
  },
  blockquote: {
    width: 940, height: 896,
    path: "M0 448v256h256v-256h-128c0 0 0-128 128-128v-128c0 0-256 0-256 256zM640 320v-128c0 0-256 0-256 256v256h256v-256h-128c0 0 0-128 128-128z"
  },
  image: {
    width: 24, height: 24,
    path: "M2.25 4a.25.25 0 00-.25.25v15.5c0 .138.112.25.25.25h3.178L14 10.977a1.75 1.75 0 012.506-.032L22 16.44V4.25a.25.25 0 00-.25-.25H2.25zm3.496 17.5H21.75a1.75 1.75 0 001.75-1.75V4.25a1.75 1.75 0 00-1.75-1.75H2.25A1.75 1.75 0 00.5 4.25v15.5c0 .966.784 1.75 1.75 1.75h3.496zM22 19.75v-1.19l-6.555-6.554a.25.25 0 00-.358.004L7.497 20H21.75a.25.25 0 00.25-.25zM9 9.25a1.75 1.75 0 11-3.5 0 1.75 1.75 0 013.5 0zm1.5 0a3.25 3.25 0 11-6.5 0 3.25 3.25 0 016.5 0z"
  },
}

// :: MenuItem
// Menu item for the `joinUp` command.
export const joinUpItem = new MenuItem({
  title: "Join with above block",
  run: joinUp,
  select: state => joinUp(state),
  icon: icons.join
})

// :: MenuItem
// Menu item for the `lift` command.
export const liftItem = new MenuItem({
  title: "Lift out of enclosing block",
  run: lift,
  select: state => lift(state),
  icon: icons.lift
})

// :: MenuItem
// Menu item for the `selectParentNode` command.
export const selectParentNodeItem = new MenuItem({
  title: "Select parent node",
  run: selectParentNode,
  select: state => selectParentNode(state),
  icon: icons.selectParentNode
})

// :: MenuItem
// Menu item for the `undo` command.
export let undoItem = new MenuItem({
  title: "Undo last change",
  run: undo,
  enable: state => undo(state),
  icon: icons.undo
})

// :: MenuItem
// Menu item for the `redo` command.
export let redoItem = new MenuItem({
  title: "Redo last undone change",
  run: redo,
  enable: state => redo(state),
  icon: icons.redo
})

// :: (NodeType, Object) → MenuItem
// Build a menu item for wrapping the selection in a given node type.
// Adds `run` and `select` properties to the ones present in
// `options`. `options.attrs` may be an object or a function.
export function wrapItem(nodeType, options) {
  let passedOptions = {
    run(state, dispatch) {
      // FIXME if (options.attrs instanceof Function) options.attrs(state, attrs => wrapIn(nodeType, attrs)(state))
      return wrapIn(nodeType, options.attrs)(state, dispatch)
    },
    select(state) {
      return wrapIn(nodeType, options.attrs instanceof Function ? null : options.attrs)(state)
    }
  }
  for (let prop in options) passedOptions[prop] = options[prop]
  return new MenuItem(passedOptions)
}

// :: (NodeType, Object) → MenuItem
// Build a menu item for changing the type of the textblock around the
// selection to the given type. Provides `run`, `active`, and `select`
// properties. Others must be given in `options`. `options.attrs` may
// be an object to provide the attributes for the textblock node.
export function blockTypeItem(nodeType, options) {
  let command = setBlockType(nodeType, options.attrs)
  let passedOptions = {
    run: command,
    enable(state) { return command(state) },
    active(state) {
      let {$from, to, node} = state.selection
      if (node) return node.hasMarkup(nodeType, options.attrs)
      return to <= $from.end() && $from.parent.hasMarkup(nodeType, options.attrs)
    }
  }
  for (let prop in options) passedOptions[prop] = options[prop]
  return new MenuItem(passedOptions)
}

// Work around classList.toggle being broken in IE11
function setClass(dom, cls, on) {
  if (on) dom.classList.add(cls)
  else dom.classList.remove(cls)
}
