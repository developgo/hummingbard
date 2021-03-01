import { writable, derived } from 'svelte/store';
function createSettings() {
  let settings = {
    state: null,
    info: {
      title: null,
      about: null,
      avatar: null,
    },
    appearance: {
      header: null,
      css: null,
    }
  }

  const { subscribe, set, update } = writable(settings);

  let kill = () => {
    update(p => {
      p = {
        state: null,
        info: {
          title: null,
          about: null,
          avatar: null,
        },
        appearance: {
          header: null,
          css: null,
        }
      }
      return p
    })
  }


  return {
    subscribe,
    set,
  };
}

export const settings = createSettings();

function createState() {
  let state = {}

  const { subscribe, set, update } = writable(state);

  let kill = () => {
    update(p => {
      p = {}
      return p
    })
  }


  return {
    subscribe,
    set,
  };
}

export const state = createState();
