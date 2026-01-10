let user = {}
let password = {}
let botStep = null
let url = null
let autoBot = false
let version = 'v1'
let lang = 'en'
let recordBotId = null
let endpoint = null
let endAt = null
const emotical = [
  'like',
  'love',
  'care',
  'haha',
  'wow',
  'sad',
  'angry'
]

const globalInteract = {
  like: 0.7,
  comment: 20,
  skip_rate: 0.7
}

const langConfig = {
  th: {
    sponsored: /ได้รับการสนับสนุน/g,
    suggested: /แนะนำสำหรับคุณ/g,
    decline: 'ปฏิเสธ',
    back: 'ย้อนกลับ',
  },
  en: {
    sponsored: /sponsored/g,
    suggested: /suggested/g,
    decline: 'Decline',
    back: 'Back',
  }
}

const versionConfig = {
  v1: {
    content_element: `div#screen-root > div[data-status-bar-color] > [data-type='vscroller'] > div[data-tracking-duration-id]`,
    define_content: {
      img_post: `div:not([data-focusable], [data-srat]) > img`
    },
    interact: {
      core: `[class="m"][data-focusable="true"] > [data-long-click-action-id][data-mcomponent="TextArea"]`,
      like_selection: `[class="m"][data-focusable="true"] > [data-long-click-action-id][data-mcomponent="TextArea"] button span:nth-child(2)`
    },
    comment: {
      action_section: `[class="m"][data-focusable="true"] > [data-long-click-action-id]`
    },
    like: `[data-long-click-action-id] > .fl.ac.am`
  },
  v2: {
    content_element: `div#screen-root > div[data-status-bar-color] > [data-type='vscroller'] > [data-actual-height="1"] + [data-focusable="true"].m.bg-s3, [data-actual-height="2"] + [data-focusable="true"].m.bg-s3`,
    define_content: {
      img_post: `img`
    },
    interact: {
      core: `[data-long-click-action-id]`,
      like_selection: `[data-long-click-action-id] button span:nth-child(2)`
    },
    comment: {
      action_section: `[data-long-click-action-id]`
    },
    like: `[data-long-click-action-id] > .fl.ac.am`
  }
}

$(document).ready(async function() {
  // console.log('ready')
  await onPageLoaded()
}) 

chrome.runtime.onMessage.addListener(async function(message, sender, sendResponse) {
  if(message.type === 'updateAutomation') {
    autoBot = message.autoBot
  }
})



// ================================
// On Page Loaded
// ================================
async function onPageLoaded () {
  // console.log('onPageLoaded')

  await setRefreshPage()

  // wait 15 sec for data response 
  await wait(1000 * 15)

  await loaded()
  await checkpoint() 
  await login()
  await skipTrueInternet()
  await findVersion()
  await disableDataMode()
  await viewer()
}

async function checkpoint() {
  const checkpointPath = /facebook\.com\/checkpoint/g
  const href = getActivityUrl()
  const currentUrl = href.split('?')[0]

  if (checkpointPath.test(currentUrl)) {
    await sendActivity('facebook_checkpoint', currentUrl, { code: 'facebook_ban'})
    await wait(2000)
    await forceStopBot()
  }

  const noFeedPath = `https://m.facebook.com/`
  if ($(_.get(versionConfig, 'v1.content_element')).length === 0 && $(_.get(versionConfig, 'v2.content_element')).length === 0 && noFeedPath === currentUrl) {
    await sendActivity('facebook_checkpoint', currentUrl, { code: 'facebook_no_feed'})
    await wait(2000)
    await forceStopBot()
  }

  await wait(5000)
}

async function setRefreshPage() {
  endAt = Date.now() + (1000 * 60 * 5)
}

async function findVersion() {
  const findVersion = _.get(versionConfig, 'v1.content_element')
  version = $(findVersion).length > 2 ? 'v1' : 'v2'

  const findLanguage = `div[role="button"][aria-label="Search"]`
  lang = $(findLanguage).length > 0 ? 'en' : 'th'

  console.log('version : ', version)
  console.log('lang : ', lang)

}

async function login() {
  console.log('login')
  if(isStep('facebook_login', 'https://m.facebook.com/login')) {
    await formInput(`#m_login_email`, user.email)
    await formInput(`#m_login_password`, password.facebook)

    await formSubmit(`button[name="login"]`, 'facebook_login_complete')
  }

  if (isStep('facebook_login_complete', 'https://m.facebook.com/login/save-device/')) {
    const cancelButton = `a[role='button']`
    await wait(2000)
    document.querySelector(cancelButton).click()
  }
}

async function viewer() {
  console.log('viewer')
  if (isStep('facebook_login_complete', 'https://m.facebook.com/') || isStep('facebook_login', 'https://m.facebook.com/')) {
    await autoMoveToContent()
    location.href = 'https://m.facebook.com/'
  }
}

async function disableDataMode() {
  const findDataModeElement = `div.m.fixed-container.top`
  if ($(findDataModeElement).length > 0) {
    //first step
    const dataMode = $(findDataModeElement).find(`div[data-action-id][data-type="text"]`)[0]
    $(dataMode).click()
    await wait(2000)

    //second step
    const optionIcon = $(`div:not([aria-label])[role="button"]`)
    $(optionIcon).click()
    await wait(2000)

    //third step
    const findDeclineOptionElement = `div[data-type="vscroller"] > div[data-action-id]`
    const declineOption = $(findDeclineOptionElement)[1]
    $(declineOption).click()
    await wait(2000)

    //forth step
    const declineButton = $(`div[aria-label=" ${_.get(langConfig, `${lang}.decline`)} "]`)
    $(declineButton).click()
    await wait(2000)
  }
}

async function autoMoveToContent() {
  let currentNode = 0
  const contentElement = _.get(versionConfig, `${version}.content_element`)

  while (currentNode < $(contentElement).length) {
    // console.log($(contentElement).length)
  // while (currentNode < 10) {
    while (!autoBot) {
      await wait(1000)
    }

    const random = _.random(2000, 5000)
    const skip = _.random(0, 1, true)
    const selectedContent = $(contentElement)[currentNode]
    const focusSelector = $(selectedContent).nextAll(`[data-actual-height="26"]`)[0]
    const contentSelector = $(focusSelector).prev()
    const interactSelector = $(focusSelector).next()

    const content = await defineContent(version === 'v1' ? selectedContent : contentSelector[0], selectedContent, interactSelector[0])

    await scrollToSelector(selectedContent)
    currentNode++

    console.log(content)
    if (globalInteract.skip_rate > skip || content.tag === 'sponsored') continue
    if (_.result(content, 'type') === 'reels') continue
    if (_.result(content, 'flag') === 'skip') continue

    await wait(random)
    // await emotion(selectedContent, 'like')
    if (content.type === 'video') {
      const response = await watching(version === 'v1' ? selectedContent : contentSelector[0], _.get(content, 'video_duration'))
      await sendActivity('facebook_watch', response.url, _.assign(content, { activity_payload : response.payload }))
      await wait(500)
      continue
    }

    if (content.comment >= globalInteract.comment && (content.type === 'picture' || content.type === 'common')) {
      await comment(version === 'v1' ? selectedContent : interactSelector[0])
    }
  }
}

async function skipTrueInternet() {
  if (isStep('facebook_login_complete', 'https://m.facebook.com/zero/policy/optin/') || isStep('facebook_login', 'https://m.facebook.com/zero/policy/optin/')) {
    // First Step
    const SkipSelection = `div[role="button"][aria-label="No thanks"], div[role="button"][aria-label="ไม่ ขอบคุณ"]`
    const SkipSelector = $(SkipSelection)
    if (SkipSelector.length > 0) $(SkipSelection).click()
    await wait(2000)

    //Second Step
    const AcceptSelection = `div[role="button"][aria-label="OK, Use Data"], div[role="button"][aria-label="ตกลง ใช้อินเทอร์เน็ต"]`
    const AcceptSelector = $(AcceptSelection)
    if (AcceptSelector.length > 0) $(AcceptSelection).click()
    await wait(1000 * 5000)
  }
}

/** 
 * 
 * @param {*} selector 
 * @param { String } emo 
 * @returns 
 */
async function emotion(selector, emo) {

  const emotionSelector = `[class="m"][data-focusable="true"] > [data-long-click-action-id] button`
  if (!_.includes(emotical, emo)) return false

  const emoButton = $(selector).find(emotionSelector)
  $(emoButton).trigger('mousedown')

}

/** 
 * 
 * @param {*} selector 
 * @param { String } text 
 * @returns 
 */
async function comment(selector, text = '') {
  //write comment [sub function]
  const writeComment = async function(text) {
    const writeSection = `div[data-shift-on-keyboard-shown="true"] textarea`
    await formInput(writeSection, text)
  }

  //send comment button [sub function]
  const sendComment = async function() {
    const sendSelector = $(`[class="m"] > div > [role="button"][aria-label="SEND"]`)
    $(sendSelector).click()
  }

  //find top comment [sub function]
  const findTopComment = async function(number) {
    const findTopCommentSelector = $(`div[dir="auto"][style="color:#000000;"]:not(:has(span))`)
    if (findTopCommentSelector.length > 0) {
      return $(findTopCommentSelector[_.random(0, number -1)]).text()
    }

    return null
  }

  const backButtonSelection = `[class="m fixed-container top"] [data-type="text"] div.fl.ac div span.f3`
  const actionSection = _.get(versionConfig, `${version}.comment.action_section`)
  const comment = $(selector).find(actionSection).siblings()[0]

  $(comment).click()

  // wait for DOM reload ready (4000 ms)
  await wait(4000)

  const url = getActivityUrl()
   if (text === '') {
    text = await findTopComment(5)
    if (!text) {
      await back(backButtonSelection)
      return 
    }
  }

  if (globalInteract.like > _.random(0, 1, true)) {
    await like()
    await sendActivity('facebook_like', url)
    
    if (_.random(0, 1, true) > globalInteract.skip_rate) {
      await writeComment(text)
      await wait(2000)
      // await sendComment()
      await sendActivity('facebook_comment', url, { comment: text })
    }
  }

  await wait(2000)
  await back(backButtonSelection)
}

async function like() {
  const likeButton = $(_.get(versionConfig, `${version}.like`))
  likeButton.click()
  await wait(3000)
}

async function share() {

}

/**
 * 
 * @param {*} selector 
 * @param { Integer } watchingTime  
 */
async function watching(selector, videoDuration) {
  const videoTag = `div[data-type="video"] > img`
  let backButtonSelection = `div[role="button"][aria-label="${_.get(langConfig, `${lang}.back`)}"]`

  //random watching time 10% - 50% of total duration video
  //if watching time less than 10 second. it need to initial 10 second
  const timeCal = parseInt(videoDuration * _.random(0.1, 0.3))
  const watchingTime = timeCal > 10 ? timeCal : 10

  $(selector).find(videoTag).trigger('click')
  await wait(1000 * watchingTime)

  const url = getActivityUrl()
  const payload = {
    video_duration: videoDuration,
    watching_time: watchingTime
  }

  if ($(backButtonSelection).length === 0) backButtonSelection = `[data-action-id] > button`
  await back(backButtonSelection)

  return {
    url: url,
    payload: payload
  }
}

/**
 * 
 * @param {*} selector 
 */
async function back(backButtonSelection) {
  const backButton = $(backButtonSelection)
  $(backButton).click()
  await wait(2000)
}

/** 
 * See number of a people do a content suggest Like, Comment, Share
 * @param {*} selector 
 * @returns {
 *  like: integer || null,
 *  comment: integer || null,
 *  comment: integer || null,
 * }
 */
async function interact(selector) {
  const interact = {
    like: null,
    comment: null,
    share: null
  }

  const core = _.get(versionConfig, `${version}.interact.core`)
  const likeSelection = _.get(versionConfig, `${version}.interact.like_selection`)

  const like = $(selector).find(likeSelection)
  const likeSiblings = $(selector).find(core).siblings()

  const comment = $(likeSiblings[0]).find(`button span:nth-child(1)`)
  const share = $(likeSiblings[1]).find(`button span:nth-child(1)`)

  if (likeSiblings.length !== 2) {
    _.assign(interact, { flag: 'skip' })
  }
  
  if (like.length === 1) {
    const likeNumber = $(like).text()
    interact.like = numberExplode(likeNumber)
  }

  if (comment.length === 1) {
    const commentNumber = $(comment).text()
    interact.comment = numberExplode(commentNumber) 
  }

  if (share.length === 1) {
    const shareNumber = $(share).text()
    interact.share = numberExplode(shareNumber)
  }

  return interact
}

/** 
 * make string capture to number format
 * @param { Integer } number 
 * @returns 
 */
function numberExplode(number) {

  //remove icon/emotical before capture
  number = _.replace(number, /\W+/g, '')
  const charSplit = /[mMkK]$/g.exec(number)

  //remove character number before capture
  number = _.replace(number, /[mMkK]$/g, '')
  const numberSplit = /\d+/g.exec(number)

  switch (_.toLower(charSplit)) {
    case 'k':
      return parseInt(parseFloat(numberSplit) * 1000)
    case 'm':
      return parseInt(parseFloat(numberSplit) * 1000000)
    default:
      return parseInt(numberSplit)
  }
}

/** 
 * 
 * @param {*} selector 
 * @param {*} headerSelector 
 * @param {*} interactSelector 
 * @returns {
 *  type: any,
 *  tag: any,
 *  owner: any
 * }
 */
async function defineContent(selector, headerSelector = '', interactSelector = '') {
  const content = {
    type: null,
    tag: null,
    owner: null
  }

  const findTag = `span[style].f5`
  const ownerTag = `span[dir="ltr"]`
  const videoType = `div[data-type="video"]`
  const imgPost = _.get(versionConfig, `${version}.define_content.img_post`)

  const isVideo = $(selector).find(videoType).length
  const isPicture = $(selector).find(imgPost).length
  let headerTag
  let ownerPost
  let interaction

  if (version === 'v1') {
    interaction = await interact(selector)
    headerTag = $(selector).find(findTag).text()
    ownerPost = $(selector).find(ownerTag)

  } else if (version === 'v2') {
    interaction = await interact(interactSelector)
    headerTag = $(headerSelector).find(findTag).text()
    ownerPost = $(headerSelector).find(ownerTag)
  }

  if ($(ownerPost[0]).text() === '') return {
    type: 'reels',
    tag: null,
    owner: null
  }

  content.owner = $(ownerPost[0]).text()

  const sponsored = _.get(langConfig, `${lang}.sponsored`)
  const suggested = _.get(langConfig, `${lang}.suggested`)

  if (sponsored.test(_.toLower(headerTag))) {
    content.tag = 'sponsored'
  } else if (suggested.test(_.toLower(headerTag))) {
    content.tag = 'suggested'
  } else if (/^\d/g.test(_.toLower(headerTag))) {
    content.tag = 'common'
  } else {
    content.tag = 'group'
  }

  if (isVideo !== 0) {
    content.type = 'video'
    const duration = extractVideoDuration(selector)
    _.assign(content, { video_duration: parseInt(duration) })
  } else if (isPicture !== 0) {
    content.type = 'picture'
  } else {
    content.type = 'common'
  }

  return _.assign(content, interaction)
}

/** 
 * 
 * @param {*} selector 
 * @returns { Int } video_duration
 */
function extractVideoDuration(selector) {
  const durationRegex = /duration=\\"PT(?<duration>\d+)/g
  const videoTag = `div[data-type="video"]`
  const attr = $(selector).find(videoTag).attr('data-extra')
  const videoDuration = durationRegex.exec(attr)
  return _.get(videoDuration, 'groups.duration') || 0
}
/**
 * 
 * @param { String } activity 
 * @param { String as Url} activityUrl 
 * @param {*} payload 
 */
async function sendActivity(activity, activityUrl, payload = null) {
  const package = {
    action: activity,
    url: activityUrl,
    payload: payload
  }

  chrome.runtime.sendMessage({ type: 'sendActivity', activity: package })
}

async function forceStopBot() {
  chrome.runtime.sendMessage({ type: 'forceStopBot' })
}

function getActivityUrl() {
  const href = _.get(window, 'location.href')
  return href
}

async function refreshPage() {
  if(endAt && endAt < Date.now()) {
    await setRefreshPage()
    location.href = 'https://m.facebook.com/'
  }
}

setInterval(async () => {
  await refreshPage()
}, 1000)