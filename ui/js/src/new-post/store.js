import { writable, derived } from 'svelte/store';
function createPost() {
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
    nsfw: false,
    anonymous: false,
    article: {
      enabled: false,
      title: null,
      subtitle: null,
      description: null,
      canonical_link: null,
      featured_image: null,
    },
  }

  const { subscribe, set, update } = writable(post);

  let activate = () => {
    update(p => {
      p.active = true
      return p
    })
  }

  let kill = () => {
    update(p => {
      p.active = false
      p.nsfw = false
      p.anonymous = false
      p.article.enabled = false
      p.article.title = null
      p.article.subtitle = null
      p.article.description = null
      p.article.canonical_link = null
      p.article.featured_image = null
      return p
    })
  }

  let updateContent = (content) => {
    update(p => {
      p.content = {
        plain_text: content.plain_text,
        html: content.html,
        length: content.length,
      }
      return p
    })
  }

  let addLink = (link) => {
    update(p => {
      p.links.push(link)
      return p
    })
  }

  let updateLinkMetadata = (id, metadata) => {
    update(p =>  {
      let ind = post.links.findIndex(x => x.id === id)
      if(ind != -1) {
        post.links[ind].metadata = metadata
      }
      return post
    })
  }

  let deleteLink = (id) => {
    update(p => {
      let ind = p.links.findIndex(x => x.id === id)
      if(ind != -1) {
        p.links.splice(ind, 1)
      }
      return p
    })
  }

  let addImage = (image) => {
    update(p =>  {
      p.images.push(image)
      return p
    })
  }

  let updateImageURL = (id, mxc) => {
    update(p =>  {
      let ind = post.images.findIndex(x => x.id === id)
      if(ind != -1) {
        post.images[ind].mxc = mxc
      }
      return post
    })
  }

  let updateImageMetadata = (id, metadata) => {
    update(p =>  {
      let ind = post.images.findIndex(x => x.id === id)
      if(ind != -1) {
        post.images[ind].caption = metadata.caption
        post.images[ind].description = metadata.description
      }
      return post
    })
  }


  let deleteImage = (id) => {
    update(p =>  {
      let ind = p.images.findIndex(x => x.id === id)
      if(ind != -1) {
        p.images.splice(ind, 1)
      }
      return p
    })
  }

  let addAttachment = (attachment) => {
    update(p =>  {
      p.attachments.push(attachment)
      return p
    })
  }

  let updateAttachmentURL = (id, mxc) => {
    update(p =>  {
      let ind = post.attachments.findIndex(x => x.id === id)
      if(ind != -1) {
        post.attachments[ind].mxc = mxc
      }
      return post
    })
  }


  let deleteAttachment = (id) => {
    update(p =>  {
      let ind = p.attachments.findIndex(x => x.id === id)
      if(ind != -1) {
        p.attachments.splice(ind, 1)
      }
      return p
    })
  }

  let toggleNSFW = () => {
    update(p =>  {
      p.nsfw = !p.nsfw
      return p
    })
  }

  let toggleAnonymous = () => {
    update(p =>  {
      p.anonymous = !p.anonymous
      return p
    })
  }

  let toggleArticleOn = () => {
    update(p =>  {
      p.article.enabled = true
      return p
    })
  }

  let toggleArticleOff = () => {
    update(p =>  {
      p.article.enabled = false
      return p
    })
  }


  let lock = () => {
    update(p =>  {
      p.locked = true
      return p
    })
  }

  let unlock = () => {
    update(p =>  {
      p.locked = false
      return p
    })
  }

  return {
    subscribe,
    set,
    activate,
    kill,
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
    toggleNSFW,
    toggleAnonymous,
    toggleArticleOn,
    toggleArticleOff,
    lock,
    unlock,
  };
}

export const post = createPost();
export const editPost = createPost();

function createArticleSettings() {

  let settings = {
    active: false,
  }

  const { subscribe, set, update } = writable(settings);

  let toggle = () => {
    update(p => {
      p.active = !p.active
      return p
    })
  }

  let kill = () => {
    update(p => {
      p.active = false
      return p
    })
  }

  let killSettings = () => {
    settings.active = false
    return Promise.resolve(settings.active)
  }


  return {
    subscribe,
    set,
    toggle,
    kill,
    killSettings,
  };
}

export const articleSettings = createArticleSettings();
