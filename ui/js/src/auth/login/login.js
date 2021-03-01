import Login from './login.svelte'
let login = document.querySelector(`.login`)
if(login) {
  new Login({
    target: login,
    hydrate: true,
  })
}
