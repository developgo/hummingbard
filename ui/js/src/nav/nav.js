let nav = document.querySelector('.nav-de')
if(nav){
  import('./nav.svelte').then(res => {
    new res.default({
      target: nav,
      hydrate: true,
    })
  })
}
