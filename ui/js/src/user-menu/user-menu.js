let um = document.querySelector(`.user-menu`)
if(um && authenticated) {
  import('../user-menu/user-menu.svelte').then(res => {
      new res.default({
          target: um,
          hydrate: true
      });
  })
}
