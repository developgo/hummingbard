import { DecorationSet, Decoration } from 'prosemirror-view'
import { Plugin } from 'prosemirror-state'

export let randomPlaceholder = () => {
  let items = [
    "Who is the great magician who makes the grass green?",
    "Suddenly the place became devoid of light.",
    "I have come to tell you that you are free.",
  ]
  return items[Math.floor(Math.random()*items.length)];
}

export default text => new Plugin({
  props: {
    decorations (state) {
      const doc = state.doc

      if (doc.childCount > 1 ||
        !doc.firstChild.isTextblock ||
        doc.firstChild.content.size > 0) return

      const placeHolder = document.createElement('div')
      placeHolder.classList.add('placeholder')
      placeHolder.setAttribute("data-placeholder", text)

      return DecorationSet.create(doc, [Decoration.widget(1, placeHolder)])
    }
  }
})

