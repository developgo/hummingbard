import { writable, derived } from 'svelte/store';

  let post = {
    active: false,
    content: {
      plain_text: null,
      html: null,
    },
    links: [],
    attachments: [],
    images: [],
    locked: false,
  }

  const newPost = writable(post);

  let initPost = () => {
    newPost.update(p => {
      p.active = true
      return p
    })
  }

  let killPost = () => {
    newPost.update(p => {
      p = {
        active: false,
        content: {
          plain_text: null,
          html: null,
        },
        links: [],
        attachments: [],
        images: [],
        locked: false,
      }
      return p
    })
  }

  let updateContent = (content) => {
    newPost.update(p => {
      p.content = {
        plain_text: content.plain_text,
        html: content.html,
      }
      return p
    })
  }

  let addLink = (link) => {
    newPost.update(p => {
      p.links.push(link)
      return p
    })
  }

  let updateLinkMetadata = (id, metadata) => {
    newPost.update(p =>  {
      let ind = post.links.findIndex(x => x.id === id)
      if(ind != -1) {
        post.links[ind].metadata = metadata
      }
      return post
    })
  }

  let deleteLink = (id) => {
    newPost.update(p => {
      let ind = p.links.findIndex(x => x.id === id)
      if(ind != -1) {
        p.links.splice(ind, 1)
      }
      return p
    })
  }

  let addImage = (image) => {
    newPost.update(p =>  {
      p.images.push(image)
      return p
    })
  }

  let updateImageURL = (id, mxc) => {
    newPost.update(p =>  {
      let ind = post.images.findIndex(x => x.id === id)
      if(ind != -1) {
        post.images[ind].mxc = mxc
      }
      return post
    })
  }

  let updateImageMetadata = (id, metadata) => {
    newPost.update(p =>  {
      let ind = post.images.findIndex(x => x.id === id)
      if(ind != -1) {
        post.images[ind].caption = metadata.caption
        post.images[ind].description = metadata.description
      }
      return post
    })
  }


  let deleteImage = (id) => {
    newPost.update(p =>  {
      let ind = p.images.findIndex(x => x.id === id)
      if(ind != -1) {
        p.images.splice(ind, 1)
      }
      return p
    })
  }

  let addAttachment = (attachment) => {
    newPost.update(p =>  {
      p.attachments.push(attachment)
      return p
    })
  }

  let updateAttachmentURL = (id, mxc) => {
    newPost.update(p =>  {
      let ind = post.attachments.findIndex(x => x.id === id)
      if(ind != -1) {
        post.attachments[ind].mxc = mxc
      }
      return post
    })
  }


  let deleteAttachment = (id) => {
    newPost.update(p =>  {
      let ind = p.attachments.findIndex(x => x.id === id)
      if(ind != -1) {
        p.attachments.splice(ind, 1)
      }
      return p
    })
  }

  let lock = () => {
    newPost.update(p =>  {
      p.locked = true
      return p
    })
  }

  let unlock = () => {
    newPost.update(p =>  {
      p.locked = false
      return p
    })
  }

  export {
    newPost,
    killPost,
    initPost,
    addLink,
    updateLinkMetadata,
    deleteLink,
    addImage,
    updateImageURL,
    updateImageMetadata,
    deleteImage,
    addAttachment,
    updateAttachmentURL,
    deleteAttachment,
    updateContent,
    lock,
    unlock,
  }
