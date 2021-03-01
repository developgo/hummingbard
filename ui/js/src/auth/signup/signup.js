import Signup from './signup.svelte'
let signup = document.querySelector(`.signup`)
if(signup) {
  new Signup({
    target: signup,
    hydrate: true,
  })
}

