let user = {}
let password = {}
let botStep = null
let url = null

chrome.runtime.onMessage.addListener(async function(message, sender, sendResponse) {
  await loaded()

  console.log('onUpdated', message, sender)
  if (message.action === "pageLoaded") {
    await wait(1500)
    onPageLoaded()
  }
})

// Global Function
async function updateBotStep (step) {
  chrome.runtime.sendMessage({ type: 'updateBotStep', step: step })
  await new Promise(r => setTimeout(r, 1000))
}

async function loaded () {
  const href = _.get(window, 'location.href')
  url = href.split('?')[0]


  chrome.runtime.sendMessage({ 
    type: 'getState',
  }, (state) => {
    user = state.user
    password = state.password
    botStep = state.botStep

    console.log(user)
  })

  await new Promise(r => setTimeout(r, 100))
}

async function wait (startTime = 1000, endTime = 1000) {
  await new Promise(r => setTimeout(r, startTime))
}

async function formInput (selector, value = null) {
  let input

  if(_.isString(selector)) {
    input = document.querySelector(selector)
  } else {
    input = selector
  }

  console.log('input', input)
  input.focus()

  await wait(500)
  
  if(input.selectionStart) {
    input.selectionStart = input.value.length
  }
  if(input.selectionEnd) {
    input.selectionEnd = input.value.length
  }

  if(!_.isNull(value)) {
    await wait(500)
    
    input.value = value

    await wait(500)
    input.blur()
  }

  await new Promise(r => setTimeout(r, 1000))

  return input
}

async function formSubmit (selector, step = null) {
  if(_.isString(selector)) {
    $(selector).click()
  } else {
    selector.click()
  }

  if(step) {
    await updateBotStep(step)
  }
}

function isStep (step, currentUrl) {
  // console.log(url, currentUrl)
  if(!_.eq(url, currentUrl)) {
    return false
  }

  if(!_.isArray(step)) {
    step = [step]
  }

  let isStep = false
  for(let i = 0; i < _.size(step); i++) {
    const s = step[i]
    if(_.eq(botStep, s)) {
      console.log(botStep, s)
      isStep = true
      break
    }
  }

  console.log(botStep, url, isStep)

  return isStep
}

function getCWiz () {
  const nodes = document.querySelectorAll(`body > c-wiz`)
  const lastChild = nodes[nodes.length - 1]
  return lastChild
}

async function scrollToSelector (selector) {
  const headerHeight = 58 + 49
  const random = _.random(20, 150)
  const elementPosition = selector.getBoundingClientRect().top + window.scrollY - headerHeight - random;

  window.scrollTo({
    top: elementPosition,
    behavior: 'smooth'
  })

  await wait()
}

// Setup Function

// ================================
// Change Name Function
// ================================
async function changeName () {
  // Scroll to Basic info - Name and then Click
  if(isStep('gmail_change_name', 'https://myaccount.google.com/personal-info')) {
    const cWiz = getCWiz()
    const button = cWiz.querySelector(`[data-rid="10090"]`)

    await scrollToSelector(button)
    await formSubmit(button)
  }

  // Click on edit
  if(isStep('gmail_change_name', 'https://myaccount.google.com/profile/name')) {
    const cWiz = getCWiz()
    const button = cWiz.querySelector(`[jsname="zRW8Re"]`)

    await wait()
    await formSubmit(button)
  }

  // Update Name and Surname
  if(isStep('gmail_change_name', 'https://myaccount.google.com/profile/name/edit')) {
    const cWiz = getCWiz()
    const inputFirstName = cWiz.querySelector(`[jsname="eFGWzf"] input`)
    const inputLastName = cWiz.querySelector(`[jsname="BcKyT"] input`)

    await formInput(inputFirstName, user.first_name_en)
    await formInput(inputLastName, user.last_name_en)

    // const input = await formInput(`[jsname="Ufn6O"] input`, user.default_google_password)

    const button = cWiz.querySelector(`[jsname="x8hlje"] button`)
    button.disabled = false
    await wait()
    await formSubmit(button, 'gmail_change_birthday')
  }

  // Back to Personal info after update
  if(isStep('gmail_change_birthday', 'https://myaccount.google.com/profile/name')) {
    const cWiz = getCWiz()

    await wait()

    const backButton = cWiz.querySelector(`[jsname="GeGHKb"]`)
    await formSubmit(backButton)
  }
}

// ================================
// Change Birthday Function
// ================================
async function changeBirthday () {
  // Scroll to Basic info - Birthday and then Click
  if(isStep('gmail_change_birthday', 'https://myaccount.google.com/personal-info')) {
    const cWiz = getCWiz()
    const button = cWiz.querySelector(`[data-rid="205"]`)

    await scrollToSelector(button)
    await formSubmit(button)
  }

  // Update Birthday
  if(isStep('gmail_change_birthday', 'https://myaccount.google.com/birthday')) {
    const cWiz = getCWiz()
    const inputMonth = cWiz.querySelector(`[jsname="Mgvhmd"] [jsname="B9mpmd"]`)

    const month = moment(user.birthday).format('M')
    inputMonth.click()
    const months = cWiz.querySelectorAll(`[jsname="Mgvhmd"] [jsname="rymPhb"] > li`)
    if(months.length > 0) {
      const selectMonth = months[month - 1]
      selectMonth.click()
      await wait()
    }

    const inputDay = cWiz.querySelector(`[jsname="mG3Az"] input`)
    const inputYear = cWiz.querySelector(`[jsname="WRCQcd"] input`)

    const day = moment(user.birthday).format('D')
    const year = moment(user.birthday).format('YYYY')
    await formInput(inputDay, day)
    await formInput(inputYear, year)

    const button = cWiz.querySelector(`[jsname="x8hlje"] button`)
    button.disabled = false

    await wait()

    await scrollToSelector(button)
    await formSubmit(button, 'gmail_change_birthday_02')
    // await formSubmit(button)
  }

  // Confirm Birthday update
  if(isStep('gmail_change_birthday_02', 'https://myaccount.google.com/birthday')) {
    const divs = document.querySelectorAll(`body > div`)
    const dialog = divs[divs.length - 1]
    const confirmButton = dialog.querySelector(`[data-mdc-dialog-action="ok"]`)
    await formSubmit(confirmButton, 'gmail_change_gender')
  }

  // Back to Personal info after update
  if(isStep('gmail_change_gender', 'https://myaccount.google.com/birthday')) {
    const cWiz = getCWiz()

    await wait()

    const backButton = cWiz.querySelector(`[jsname="GeGHKb"]`)
    await formSubmit(backButton)
  }
}

// ================================
// Change Gender Function
// ================================
async function changeGender () {
  // Scroll to Basic info - Name and then Click
  if(isStep('gmail_change_gender', 'https://myaccount.google.com/personal-info')) {
    const cWiz = getCWiz()

    const button = cWiz.querySelector(`[data-rid="206"]`)

    await scrollToSelector(button)
    await formSubmit(button)
  }

  // Update Gender
  if(isStep('gmail_change_gender', 'https://myaccount.google.com/gender')) {
    const cWiz = getCWiz()

    const radioFemale = cWiz.querySelector(`[jsname="aHyS0b"] [jsname="rIvfQc"] input`)
    const radioMale = cWiz.querySelector(`[jsname="aHyS0b"] [jsname="DUTWpb"] input`)
    const radioOther = cWiz.querySelector(`[jsname="aHyS0b"] [jsname="zSobD"] input`)

    await wait()
    
    if(_.eq(user.gender, 'female')) {
      radioFemale.checked = true
      radioFemale.click()
    } else if(_.eq(user.gender, 'male')) {
      radioMale.checked = true
      radioMale.click()
    } else {
      radioOther.checked = true
      radioOther.click()
    }

    await wait(2000)

    const backButton = cWiz.querySelector(`[jsname="GeGHKb"]`)
    await formSubmit(backButton, 'gmail_change_recovery')
  }
}

// ================================
// Change Contact Function
// ================================
async function changeContact () {
  // Scroll to Contact info - Email and then Click
  if(isStep(['gmail_change_recovery', 'gmail_change_alternate'], 'https://myaccount.google.com/personal-info')) {
    const cWiz = getCWiz()

    const button = cWiz.querySelector(`a[href="email"]`)

    await scrollToSelector(button)
    await formSubmit(button)
  }

  if(isStep('gmail_change_recovery', 'https://myaccount.google.com/email')) {
    const cWiz = getCWiz()
    const button = cWiz.querySelector(`a[href^="recovery/email"]`)

    await scrollToSelector(button)
    await formSubmit(button)
  }

  if(isStep('gmail_change_recovery', 'https://accounts.google.com/v3/signin/challenge/pwd')) {
    const input = await formInput(`[jsname="Ufn6O"] input`, user.default_google_password)
    await formSubmit(`[jsname="DH6Rkf"] [jsname="LgbsSe"]`)
  }

  if(isStep('gmail_change_recovery', 'https://myaccount.google.com/recovery/email')) {
    const cWiz = getCWiz()
    const input = await formInput(`[jsname="vhZMvf"] input`, '')

    const button = cWiz.querySelector(`[jsname="x8hlje"] button`)
    button.disabled = false

    await wait()
    await formSubmit(button)

    await wait()

    const backButton = cWiz.querySelector(`[jsname="GeGHKb"]`)
    await formSubmit(backButton, 'gmail_change_alternate')
  }


  if(isStep('gmail_change_alternate', 'https://myaccount.google.com/email')) {
    const cWiz = getCWiz()
    const button = cWiz.querySelector(`a[href="alternateemail"]`)

    await scrollToSelector(button)
    await formSubmit(button)
  }

  if(isStep('gmail_change_alternate', 'https://myaccount.google.com/alternateemail')) {
    const cWiz = getCWiz()
    const button = cWiz.querySelector(`[jsname="nANYu"] button`)

    await scrollToSelector(button)
    await formSubmit(button, 'gmail_change_alternate_02')

    await wait()

    const backButton = cWiz.querySelector(`[jsname="GeGHKb"]`)
    await formSubmit(backButton, 'gmail_change_password')
  }

  if(isStep('gmail_change_password', 'https://myaccount.google.com/email')) {
    const cWiz = getCWiz()

    await wait()

    const backButton = cWiz.querySelector(`[jsname="GeGHKb"]`)
    await formSubmit(backButton)
  }

}

// ================================
// Change Password Function
// ================================
async function changePassword () {
  // Scroll to Contact info - Email and then Click
  if(isStep('gmail_change_password', 'https://myaccount.google.com/personal-info')) {
    const cWiz = getCWiz()

    const button = cWiz.querySelector(`[data-rid="401"]`)

    await scrollToSelector(button)
    await formSubmit(button)
  }

  if(isStep('gmail_change_password', 'https://accounts.google.com/v3/signin/challenge/pwd')) {
    const input = await formInput(`[jsname="Ufn6O"] input`, user.default_google_password)
    await formSubmit(`[jsname="DH6Rkf"] [jsname="LgbsSe"]`)
  }

  if(isStep('gmail_change_password', 'https://myaccount.google.com/signinoptions/password')) {
    const inputPassword = await formInput(`[jsname="PaNBk"] input`, password.google)
    const inputConfirmPassword = await formInput(`[jsname="Y3xtvc"] input`, password.google)

    await formSubmit(`[jsname="XTYNyb"] button`, 'gmail_change_complete')
  }


}
// ================================
// On Page Loaded
// ================================
async function onPageLoaded () {
  // await wait()
  console.log('user', user)
  console.log('botStep', botStep)

  // console.log(isStep('gmail_setup', 'https://accounts.google.com/v3/signin/identifier'))
  if(isStep('gmail_setup', 'https://accounts.google.com/v3/signin/identifier')) {
    const input = await formInput(`[jsname="MZArnb"] input`, user.email)
    await formSubmit(`[jsname="LgbsSe"]`, 'gmail_setup')
  }
  
  if(isStep(['gmail_setup', 'gmail_change'], 'https://accounts.google.com/v3/signin/challenge/pwd')) {
    console.log(`defaultGooglePassword`, user.default_google_password)
    const input = await formInput(`[jsname="Ufn6O"] input`, user.default_google_password)
    await formSubmit(`#passwordNext [jsname="LgbsSe"]`, 'gmail_change')
  }
  
  if(isStep('gmail_change', 'https://accounts.google.com/v3/signin/challenge/selection')) {
    await formSubmit(`[jsname="rEuO1b"] [data-challengetype="12"]`, 'gmail_change')
  }

  if(isStep('gmail_change', 'https://accounts.google.com/signin/v2/challenge/kpe')) {
    const input = await formInput(`[jsname="Ufn6O"] input`, user.default_google_recovery)
    await formSubmit(`[jsname="DH6Rkf"] [jsname="LgbsSe"]`, 'gmail_change')
  }

  if(isStep('gmail_change', 'https://gds.google.com/web/chip')) {
    await wait()
    await formSubmit(`[jsname="NPfFvd"] [jsname="bySMBb"]`, 'gmail_change')
  }

  // Redirect to Personal info after login
  if(_.eq(botStep, 'gmail_change') && _.eq(url, 'https://myaccount.google.com/')) {
    const cWiz = getCWiz()
    const button = cWiz.querySelector(`[href="personal-info"] .GWwaOc`)

    await formSubmit(button, 'gmail_change_name')
  }


  await changeName()
  await changeBirthday()
  await changeGender()
  await changeContact()
  await changePassword()


  if(isStep('gmail_login', 'https://accounts.google.com/v3/signin/identifier')) {
    const input = await formInput(`[jsname="MZArnb"] input`, user.email)
    await formSubmit(`[jsname="LgbsSe"]`)
  }
  
  if(isStep('gmail_login', 'https://accounts.google.com/v3/signin/challenge/pwd')) {
    console.log(`Google Password`, password.google)
    const input = await formInput(`[jsname="Ufn6O"] input`, password.google)
    await formSubmit(`#passwordNext [jsname="LgbsSe"]`, 'gmail_login_completed')
  }
}