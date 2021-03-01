let cr = document.querySelector(`.create-room`)
if(cr) {
  import('./create-room.svelte').then(res => {
      new res.default({
          target: cr,
          props: {
          },
          hydrate: true
      });
  })
}

