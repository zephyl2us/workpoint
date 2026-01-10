let user = {}
let password = {}

// chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
//   console.log('onUpdated')
//   if (message.action === "pageLoaded") {
//     console.log('pageLoaded')
//   }
// })

$('#navigation > li').click((e) => {
  $('#navigation > li').removeClass('active')
  // const target = e.target.dataset.nav
  const $target = e.target
  const id = $($target).attr('for')
  $($target).addClass('active')
  
  $('.content').removeClass('active')
  $(`#${id}`).addClass('active')
})

function getGender (gender) {
  const genderCode = {
    male: 'ชาย',
    female: 'หญิง'
  }
  
  return _.get(genderCode, gender) || 'ไม่ระบุ'
}

function loaded () {
  chrome.runtime.sendMessage({ 
    type: 'getState',
  }, (state) => {
    user = state.user
    password = state.password
    botStep = state.botStep
    autoBot = state.isAutomation

    if(!_.get(user, 'id')) {
      $('.popup').addClass('hidden')
      $('.intro').removeClass('hidden')
      return
    }
  
    $('.intro').addClass('hidden')
    $('.popup').removeClass('hidden')

    $(`#userName`).html(`${_.get(user, 'first_name_en')} ${_.get(user, 'last_name_en')}`)
    $(`#userEmail`).html(_.get(user, 'email'))

    $(`#userNameTh`).html(`${_.get(user, 'first_name')} ${_.get(user, 'last_name')}`)
    
    const gender = getGender(_.get(user, 'gender'))
    $(`#userGender`).html(gender)

    const birthday = _.get(user, 'birthday')
    if(birthday) {
      $(`#userBirthday`).html(`${moment(birthday).format('DD MMM YYYY')} (${(parseInt(moment(birthday).format('YYYY')) + 543)})`)
    }

    let address = _.get(user, 'address')
    address = `${address} ${_.get(user, 'tambon')}`
    address = `${address} ${_.get(user, 'district')}`
    address = `${address} ${_.get(user, 'province')}`

    $(`#userAddress`).html(address)

    $('#googlePassword').html(_.get(password, 'google'))
    $('#facebookPassword').html(_.get(password, 'facebook'))

    $('#botStep').html(botStep)

    if(autoBot) $(`#autoBot`).attr('checked', true)
  })
}

$(document).ready(function() {
  loaded()
  console.log('user', user)
})

// Global Function
async function updateBotStep (step) {
  chrome.runtime.sendMessage({ type: 'updateBotStep', step: step })
  await new Promise(r => setTimeout(r, 100))
}

// Gmail Setup
$(`#gmailSetupUser`).click(async () => {
  await updateBotStep('gmail_setup')
  chrome.tabs.create({ url: 'https://accounts.google.com/' })
})

// Gmail Login
$(`#gmailLogin`).click(async () => {
  await updateBotStep('gmail_login')
  chrome.tabs.create({ url: 'https://accounts.google.com/' })
})

$(`#autoBot`).click(async () => {

  var botState = $(`#autoBot`).attr('checked')
  botState === 'checked' ? $(`#autoBot`).removeAttr('checked') : $(`#autoBot`).attr('checked', true)

  chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, { type: 'updateAutomation', autoBot: botState === 'checked' ? false : true })
  })
})