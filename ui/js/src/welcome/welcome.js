let el = document.querySelector('.welcome')
if(el && window.state?.rooms) {
  import('../welcome/welcome.svelte').then(res => {
    new res.default({
      target: el,
      hydrate: true,
    })
  })
}
