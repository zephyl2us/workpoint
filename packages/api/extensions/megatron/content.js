
let endpoint = null
let adsPowerId = null

chrome.runtime.sendMessage({ 
  type: 'adsPowerLoaded'
}, async (response) => {
  console.log(response)
})

chrome.runtime.sendMessage({ 
  type: 'getState',
}, async (state) => {
  endpoint = state.endpoint
  adsPowerId = state.adspower_id
  
  await getUser()
})


async function getUser () {
  console.log(endpoint, adsPowerId)
  // console.log("test")
  // const response = await axios.get(`${endpoint}/${adsPowerId}`)
  //   .then((res) => {
  //     return res
  //   }).catch((err) => {
  //     console.log(err)
  //     return false
  //   })
    
  // console.log("error : ", response)

  try {
    const apiResponse = await axios.get(`${endpoint}/${adsPowerId}`)
      .then((res) => {
        return res
      }).catch((err) => {
        console.log(err)
        return false
      })
    if (!apiResponse) return
    console.log("Data from API:", apiResponse.data)
    const user = _.get(apiResponse, 'data.record')
    const userBot = _.get(apiResponse, 'data.bot')
    console.log(user)

    chrome.runtime.sendMessage({ 
      type: 'receiveUser',
      user: user
    })

    const type = _.get(userBot, 'type')

    if(!type) {
      return
    }

    if(type === 'farm') {
      const sites = _.get(userBot, 'payload.sites')
      const recordId = _.get(userBot, 'id')
      chrome.runtime.sendMessage({
        type: 'runWebsite',
        sites: sites,
        record_bot_id: recordId
      })
    }
    
  } catch (error) {
    console.error("Error fetching data from API:", error)
  }
}
