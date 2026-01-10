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
    endpoint = state.endpoint
    botStep = state.botStep
    autoBot = state.isAutomation
    recordBotId = state.recordBotId

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
  console.log(url, currentUrl)
  console.log(botStep, step)
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

async function scrollToSelector (selector) {
  const headerHeight = 49
  const random = _.random(20, 150)
  const elementPosition = selector.getBoundingClientRect().top + window.scrollY - headerHeight - random;

  window.scrollTo({
    top: elementPosition,
    behavior: 'smooth'
  })

  await wait()
}