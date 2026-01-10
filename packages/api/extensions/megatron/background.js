// importScripts('./plugins/jquery-3.7.1.min.js')
importScripts('./plugins/axios.min.js')
importScripts('./plugins/crypto-js.min.js')
importScripts('./plugins/lodash.min.js')

let state = {
  // endpoint: `https://api-dev.megatron.team/core/extension/ant`,
  // endpoint: `https://api-aem.megatron.team/core/extension/ant`,
  endpoint: `https://api.megatron.team/core/extension/ant`,
  adspower_id: null,
  gologin_id: null,
  user: {},
  password: {},
  isAutomation: false,
  currentWebsiteIndex: null,
  totalWebsite: null,
  sites: [],
  
  // botStep: null
  botStep: 'facebook_login',
  recordBotId: null
}

let tabStatus = {}


/**
 * Run once at first time only For GOLOGIN
 */
// chrome.gologin.getProfileID(async (id) => {

//   state.gologin_id = id

//   try {
//     const apiResponse = await fetch(`${state.endpoint}/${id}`)
//     const data = await apiResponse.json()
//     console.log("Data from API:", data)
//     const user = _.get(data, 'record')
//     const userBot = _.get(data, 'bot')
//     console.log(user)

//     await receiveUser(user)

//     const type = _.get(userBot, 'type')

//     if(!type) {
//       return
//     }

//     if(type === 'farm') {
//       const sites = _.get(userBot, 'payload.sites')
//       const recordBotId = _.get(userBot, 'id')

//       state.sites = sites
//       state.currentWebsiteIndex = null
//       state.totalWebsite = null
//       state.isAutomation = true
//       state.recordBotId = recordBotId

//       runWebsite()
//     }
    
//   } catch (error) {
//     console.error("Error fetching data from API:", error)
//   }
// })


/*
 * Main Function
 */
chrome.runtime.onMessage.addListener(async (message, sender, callback) => {

  if(message.type === 'getState') {
    await callback(state)
  }

  if(message.type === 'adsPowerLoaded') {
    const url = _.get(sender, 'url')
    const queryParameters = url.split('?')[1]
    const urlParameters = new URLSearchParams(queryParameters)

    const id = urlParameters.get('id')
    state.adspower_id = id

    const response = {
      adspower_id: id
    }

    await callback(response)
  }

  if(message.type === 'getAdsPowerId') {
    await callback(adsPowerId)
  }

  if(message.type === 'receiveUser') {
    receiveUser(message.user)
    // callback()
  }

  if(message.type === 'runWebsite') {
    console.log('runwebsite')
    const sites = message.sites
    const recordBotId = message.record_bot_id
    state.sites = sites
    state.currentWebsiteIndex = null
    state.totalWebsite = null
    state.isAutomation = true
    state.recordBotId = recordBotId

    runWebsite ()
  }

  if(message.type === 'updateBotStep') {
    state.botStep = message.step
  }

  if (message.type === 'sendActivity') {
    const url = `${state.endpoint}/bot/${state.recordBotId}/activity`
    const options = {
      method: 'POST',
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message.activity),
    }
    const response = await fetch(url, options)
      .then(res => {
        return res
      })
      .catch(err => {
        return err
      })
    // const response = await axios
    //   .post(`${state.endpoint}/bot/${state.recordBotId}/activity`, message.activity)
    //   .then(res => {
    //     return res
    //   })
    //   .catch(err => {
    //     return err
    //   })
    console.log(response)
  }

  if (message.type === 'forceStopBot') {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, async (dataUrl) => {
      const url = `${state.endpoint}/bot/${state.recordBotId}/stop`
      const options = {
        headers: {
          "Content-Type": "application/json",
        },
        method: 'POST',
        body: JSON.stringify({
          screenshot: dataUrl
        })
      }
      const response = await fetch(url, options)
        .then(res => {
          return res
        })
        .catch(err => {
          return err
        })

      // console.log(response)
    });
    
  }

  // if (message.type === 'screenshot') {
  //   console.log('screenshot')
  //   chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
  //     console.log(dataUrl)
  //   });
  // }
})

/*
 * On Tab Created
 */
chrome.tabs.onCreated.addListener((tab) => {
  if(!state.isAutomation) {
    return false
  }

  let url = tab.url || tab.pendingUrl
  url = _.replace(url, 'https://', '')
  url = _.replace(url, 'http://', '')
  url = _.split(url, '/')[0]
  console.log(url)

  let endAt = null

  const awayOpenUrls = [
    '127.0.0.1:20725',
    'start.adspower.net',
    'facebook.com',
    'www.facebook.com',
    'm.facebook.com'
  ]

  if(!_.includes(awayOpenUrls, url)) {
    endAt = Date.now() + (_.random(10, 15) * 1000)
  }

  tabStatus[tab.id] = {
    start_at: Date.now(),
    end_at: endAt
  }
  console.log(tabStatus)
})

/*
 * On Tab Closed
 */
chrome.tabs.onRemoved.addListener((tab, tabId) => {
  if(!state.isAutomation) {
    return false
  }

  console.log(tab)
  delete tabStatus[tabId]
})

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  // console.log('onUpdated')
  if (changeInfo.status == 'complete') {
    chrome.tabs.sendMessage(tabId, { action: "pageLoaded" })
  }
});

/*
 * MAIN : Run website after fetch user
 */
async function runWebsite () {
  const sites = state.sites
  let index = state.currentWebsiteIndex
  if(index === null) {
    index = 0
  } else {
    index++
  }
  state.currentWebsiteIndex = index

  await new Promise(r => setTimeout(r, 1000 * 15))

  if(index >= _.size(sites)) {
    runFacebook()
    return
  }

  const site = _.get(sites, index)

  console.log(`runWebsite`, site)

  chrome.tabs.create({ url: site })

  runWebsite()
}

async function receiveUser(user) {
  console.log(`receiveUser`, state.user)
  state.user = user

  // For Testing Only
  // state.botStep = 'gmail_change_password'

  const passwords = _.get(state.user, 'passwords')
  _.each(passwords, (security) => {
    const social = security.social
    const hash = security.hash

    const passphrase = '84269713'

    const bytes = CryptoJS.AES.decrypt(hash, passphrase)
    const passwordDecrypted = bytes.toString(CryptoJS.enc.Utf8)

    _.set(state.password, `${social}`, passwordDecrypted)
  })
}

/*
 * 
 */
async function runFacebook () {
  console.log(`runFacebook`)
  const facebook = `https://m.facebook.com/login`
  chrome.tabs.create({ url: facebook })
  state.botStep = 'facebook_login'
}

/*
 * 
 */
function autoCloseTab () {
  chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
      const status = tabStatus[tab.id] || null
      
      if(!status) continue

      const startAt = _.get(status, 'start_at')
      const endAt = _.get(status, 'end_at')
      if(endAt && endAt < Date.now()) {
        console.log(`Close Tab #${tab.id}, URL: ${tab.url}, Run Time: ${(endAt - startAt) / 1000}`)
        chrome.tabs.remove(tab.id)
      }

    }
  })
}

/*
 * 
 */
setInterval(() => {
  autoCloseTab()
}, 1000)