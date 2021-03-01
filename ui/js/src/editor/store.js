import { writable } from 'svelte/store';


function createContent() {
    const { subscribe, set, update } = writable({
      html: null,
      json: null,
      plain_text: null,
    });

  let sync = (x) => {
    update(n => x)
  }

	return {
      subscribe,
      sync,
      reset: () => set(0)
	};
}

export const content = createContent();

function createEditorState() {

  let state = {
    focused: false,
  }

    const { subscribe, set, update } = writable(state);

  let focus = (x) => {
    update(state => {
      state.focused = true
      return state
    })
  }

  let blur = (x) => {
    update(state => {
      state.focused = false
      return state
    })
  }

	return {
      subscribe,
      focus, 
      blur,
      reset: () => set(0)
	};
}

export const editorState = createEditorState();
