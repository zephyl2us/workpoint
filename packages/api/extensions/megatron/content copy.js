// console.log('content.js')

// // const _ = 'plugins/lodash'

// const facebookUrl = 'https://www.facebook.com'
// let config = null
// let currentUrl = null
// let currentUserId = null
// let status = null

// function onStart () {
//   console.log('onStart')
//   currentUrl = window.location.href
//   currentUserId = $.cookie('c_user')

//   console.log(currentUserId)
//   console.log(facebookUrl , currentUrl)
//   if(_.eq(facebookUrl + '/', currentUrl)) {
//     console.log('facebook')
//   }

//   // setTimeout(() => {
//   //   // window.location.href = `${facebookUrl}/${currentUserId}`
//   //   window.location.replace(`${facebookUrl}/${currentUserId}`)
//   // }, 5000)
// }

// function onURLChanged(url) {
//   $(document).ready(function() {
//     onStart()
//   })
// }

// $(document).ready(function() {
//   console.log('onReady')
//   onStart()

//   chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     if (message.message === 'urlChanged') {
//       onURLChanged(message.url)
//     }
//   })
// })
