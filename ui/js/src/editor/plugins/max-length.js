import { DecorationSet, Decoration } from 'prosemirror-view'
import { Plugin } from 'prosemirror-state'

export default content => new Plugin({
  props: {
    decorations(state) {
      let length = content - state.doc.textContent.length
      return DecorationSet.create(state.doc, [
        Decoration.inline(content+1, state.doc.content.size, {style: "color: red"})
      ])
    }
  }
})

