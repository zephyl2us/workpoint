'use strict'

const _ = use('lodash')
const moment = use('moment')
const md5 = use('md5')
const Config = use('Config')
const Redis = use('Redis')
const Helper = use('App/Helper')
const BrowserRepository = make('App/Repositories/BrowserRepository')

class ResultAuthRepository {

  static get inject() {
    return []
  }

  constructor() {
		this.Redis = Redis.connection('lottery')
    this.authExpire = (1 * 60 * 60) - 20
  }

  async _default () {
    const { username, password } = Config.get(`lotteryAuth.`)
    const url = ''
    const options = {}

    const result = await BrowserRepository.puppeteer(url, options, async (page) => {
    })

    return result
  }


  async lottoone () {
    const { username, password } = Config.get(`lotteryAuth.lottoone`)
    const url = 'https://lottoone.net/login'
    const options = {}

    const result = await BrowserRepository.puppeteer(url, options, async (page) => {
      await page.waitForSelector('#authLogin', { timeout: 10000 });
      await page.type('#inputUsername', username)
      await page.type('#inputPassword', password)
      await page.click('form button')
      await page.waitForNavigation({ 
        waitUntil: 'networkidle0',
        timeout: 10000
      });
  
      const successUrl = 'https://lottoone.net/member'
      const currentPageUrl = await page.url()
  
      if (currentPageUrl != successUrl) {
        await browser.close()
        return false
      }
  
      const cookie = await page.cookies()      
      await this.Redis.set(`cookie:lottoone`, JSON.stringify(cookie), 'EX', this.authExpire)

      return cookie
    })

    return result
  }

  async ruamchoke () {
    const { username, password } = Config.get(`lotteryAuth.ruamchoke`)
    const url = 'https://app.ruamchoke.com/'
    const options = {
      wait_until: 'networkidle0'
    }

    const result = await BrowserRepository.puppeteer(url, options, async (page) => {

      const stat = await page.waitForSelector('input#username', { timeout: 10000 })
      await page.type('input#username', username)
      await page.type('input#password', password)
      await page.click('button[name=loginbtn]')
      await page.waitForNavigation({ 
        waitUntil: 'load',
        timeout: 10000
      });

      const successUrl = 'https://app.ruamchoke.com/member.php'
      const currentPageUrl = await page.url()

      if (currentPageUrl != successUrl) {
        return false
      }

      const cookie = await page.cookies()
      await this.Redis.set(`cookie:ruamchoke`, JSON.stringify(cookie), 'EX', this.authExpire)

      return cookie
    })

    return result
  }

  async ruaychoke () {
    const { username, password } = Config.get(`lotteryAuth.ruaychoke`)
    const url = 'https://www.ruaychoke.com/'
    const options = {}

    const result = await BrowserRepository.puppeteer(url, options, async (page) => {
      await page.waitForSelector('input#username', { timeout: 10000 });
      await page.type('input#username', username)
      await page.type('input#password', password)
      await page.click('button[name=loginbtn]')
      await page.waitForNavigation({ 
        waitUntil: 'load',
        timeout: 10000
      });

      const successUrl = 'https://www.ruaychoke.com/member.php'
      const currentPageUrl = await page.url()

      if (currentPageUrl != successUrl) {
        return false
      }

      const cookie = await page.cookies()
      await this.Redis.set(`cookie:ruaychoke`, JSON.stringify(cookie), 'EX', this.authExpire)

      return cookie
    })

    return result
  }

  async haichoke () {
    const { username, password } = Config.get(`lotteryAuth.haichoke`)
    const url = 'https://www.haichoke.com/'
    const options = {}

    const result = await BrowserRepository.puppeteer(url, options, async (page) => {
      await page.waitForSelector('input#username', { timeout: 10000 });
      await page.type('input#username', username)
      await page.type('input#password', password)
      await page.click('button[name=loginbtn]')
      await page.waitForNavigation({ 
        waitUntil: 'load',
        timeout: 10000
      });

      const successUrl = 'https://www.haichoke.com/member.php'
      const currentPageUrl = await page.url()

      if (currentPageUrl != successUrl) {
        return false
      }

      const cookie = await page.cookies()
      await this.Redis.set(`cookie:haichoke`, JSON.stringify(cookie), 'EX', this.authExpire)

      return cookie
    })

    return result
  }

  async jakchoke () {
    const { username, password } = Config.get(`lotteryAuth.jakchoke`)
    const url = 'https://www.jakchoke.com/'
    const options = {}

    const result = await BrowserRepository.puppeteer(url, options, async (page) => {
      await page.waitForSelector('input#username', { timeout: 10000 });
      await page.type('input#username', username)
      await page.type('input#password', password)
      await page.click('button[name=loginbtn]')
      await page.waitForNavigation({ 
        waitUntil: 'load',
        timeout: 10000
      });

      const successUrl = 'https://www.jakchoke.com/member.php'
      const currentPageUrl = await page.url()

      if (currentPageUrl != successUrl) {
        return false
      }

      const cookie = await page.cookies()
      await this.Redis.set(`cookie:jakchoke`, JSON.stringify(cookie), 'EX', this.authExpire)

      return cookie
    })

    return result
  }

  async taweechoke () {
    const { username, password } = Config.get(`lotteryAuth.taweechoke`)
    const url = 'https://www.taweechok.com/'
    const options = {}

    const result = await BrowserRepository.puppeteer(url, options, async (page) => {
      await page.waitForSelector('input#username', { timeout: 10000 });
      await page.type('input#username', username)
      await page.type('input#password', password)
      await page.click('button[name=loginbtn]')
      await page.waitForNavigation({ 
        waitUntil: 'load',
        timeout: 10000
      });

      const successUrl = 'https://www.taweechok.com/member.php'
      const currentPageUrl = await page.url()

      if (currentPageUrl != successUrl) {
        return false
      }

      const cookie = await page.cookies()
      await this.Redis.set(`cookie:taweechoke`, JSON.stringify(cookie), 'EX', this.authExpire)

      return cookie
    })

    return result
  }

  async lottovip() {
    const { username, password } = Config.get(`lotteryAuth.lottovip`)
    const url = 'https://www.lottovip.com/login'
    const options = {}

    const result = await BrowserRepository.puppeteer(url, options, async (page) => {
      await page.waitForSelector('form [name="username"]', { timeout: 10000 });
      await page.type('form [name="username"]', username)
      await page.type('form [name="password"]', password)
      await page.click('form [type="submit"]')
      await page.waitForNavigation({ 
        waitUntil: 'networkidle0',
        timeout: 10000
      });

      const successUrl = 'https://www.lottovip.com/member/main'
      const currentPageUrl = await page.url()

      if (currentPageUrl != successUrl) {
        return false
      }

      const cookie = await page.cookies()
      await this.Redis.set(`cookie:lottovip`, JSON.stringify(cookie), 'EX', this.authExpire)

      return cookie
    })

    return result
  }

  async luxnumber() {
    const url = `https://www.luxnumber.com/lapi/auth/login`

    const { username, password } = Config.get(`lotteryAuth.luxnumber`)
    const loginObj = {
      username: username,
      password: password
    }

    const options = {
      method: 'POST',
      uri: url,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": _.size(JSON.stringify(loginObj)),
      },
      body: loginObj,
      json: true
    }

		const result = await BrowserRepository.request(options)
    await this.Redis.set(`cookie:luxnumber`, JSON.stringify(result), 'EX', this.authExpire)
    return result
  }

  async yeslotto() {
    const url = `https://yeslotto.com/api/member/login`

    const { username, password } = Config.get(`lotteryAuth.yeslotto`)
    const loginObj = {
      username: username,
      password: password
    }

    const options = {
      method: 'POST',
      uri: url,
      headers: {
        "Content-Type": "application/json",
      },
      body: loginObj,
      json: true
    }

		const result = await BrowserRepository.request(options)
    await this.Redis.set(`cookie:yeslotto`, JSON.stringify(result), 'EX', this.authExpire)
    return result
  }

  async cat888 () {
    const { username, password } = Config.get(`lotteryAuth.cat888`)
    const url = 'https://cat888.co/login'
    const options = {}

    const result = await BrowserRepository.puppeteer(url, options, async (page) => {
      await page.waitForSelector('input[name=username]', { timeout: 10000 });
      await page.type('input[name=username]', username)
      await page.type('input[name=password]', password)
      await page.click('button.btn.btn-primary.btn-regis')
      await page.waitForNavigation({ 
        waitUntil: 'networkidle0',
        timeout: 10000
      });

      const successUrl = 'https://cat888.co/'
      const currentPageUrl = await page.url()

      if (currentPageUrl != successUrl) {
        return false
      }

      const cookie = await page.cookies()
      await this.Redis.set(`cookie:cat888`, JSON.stringify(cookie), 'EX', this.authExpire)

      return cookie
    })

    return result
  }

  async movewin () {
    const { username, password } = Config.get(`lotteryAuth.movewin`)
    const url = 'https://edcstudio.live/login'
    const options = {}

    const result = await BrowserRepository.puppeteer(url, options, async (page) => {
      await page.waitForSelector('input[name=username]', { timeout: 10000 });
      await page.type('input[name=username]', username)
      await page.type('input[name=password]', password)
      await page.click('form button')
      await page.waitForNavigation({ 
        waitUntil: 'networkidle0',
        timeout: 10000
      });

      const successUrl = 'https://edcstudio.live/member?auth_domain=1'
      const currentPageUrl = await page.url()

      if (currentPageUrl != successUrl) {
        return false
      }

      const cookie = await page.cookies()
      await this.Redis.set(`cookie:movewin`, JSON.stringify(cookie), 'EX', this.authExpire)

      return cookie
    })

    return result
  }

  async siamlotto () {
    const { username, password } = Config.get(`lotteryAuth.siamlotto`)
    const url = 'https://member.siamlotto.co/user/login'
    const options = {}

    const result = await BrowserRepository.puppeteer(url, options, async (page) => {
      await page.waitForSelector('#login-form-login', { timeout: 10000 });
      await page.type('#login-form-login', username)
      await page.type('#login-form-password', password)
      await page.click('form#login-form button')
      await page.waitForNavigation({ 
        waitUntil: 'networkidle0',
        timeout: 10000
      });

      const successUrl = 'https://member.siamlotto.co/site/home'
      const currentPageUrl = await page.url()

      if (currentPageUrl != successUrl) {
        return false
      }

      const cookie = await page.cookies()
      await this.Redis.set(`cookie:siamlotto`, JSON.stringify(cookie), 'EX', this.authExpire)

      return cookie
    })

    return result
  }

  async lottorich28 () {
    const url = 'https://api.lottorich28.co/api/auth/login'

    const { username, password } = Config.get(`lotteryAuth.lottorich28`)
    const loginObj = {
      username: username,
      password: password
    }

    const options = {
      method: 'POST',
      uri: url,
      body: loginObj,
      json: true
    }

		const result = await BrowserRepository.request(options)
    await this.Redis.set(`cookie:lottorich28`, JSON.stringify(result), 'EX', this.authExpire)

    return result
    
  }

  async uwin789 () {
    const { username, password } = Config.get(`lotteryAuth.uwin789`)
    const url = 'https://www.uwin789.asia/signin'
    const options = {}

    const result = await BrowserRepository.puppeteer(url, options, async (page) => {
      await page.waitForSelector('input[type=text]', { timeout: 10000 });
      await page.type('input[type=text]', username)
      await page.type('input[type=password]', password)
      await page.click('button[type=submit]')
      await page.waitForNavigation({ 
        waitUntil: 'networkidle0',
        timeout: 10000
      });

      const successUrl = 'https://www.uwin789.asia/dashboard'
      const currentPageUrl = await page.url()
      const hasNews = /view-news/g.test(currentPageUrl)

      if (currentPageUrl != successUrl && !hasNews) {
        return false
      }

      const cookie = await page.cookies()
      await this.Redis.set(`cookie:uwin789`, JSON.stringify(cookie), 'EX', this.authExpire)

      return cookie
    })

    return result
  }

  async x4rich () {
    const { username, password } = Config.get(`lotteryAuth.x4rich`)
    const url = 'https://x4rich.com/login/'
    const options = {}

    const result = await BrowserRepository.puppeteer(url, options, async (page) => {
      await page.waitForSelector('input#_user', { timeout: 10000 });
      await page.type('input#_user', username)
      await page.type('input#_pass', password)
      await page.click('button#login_btn')
      await page.waitForNavigation({ 
        waitUntil: 'networkidle0',
        timeout: 10000
      });

      const successUrl = 'https://x4rich.com/home/'
      const currentPageUrl = await page.url()

      if (currentPageUrl != successUrl) {
        return false
      }

      const cookie = await page.cookies()
      await this.Redis.set(`cookie:x4rich`, JSON.stringify(cookie), 'EX', this.authExpire)

      return cookie
    })

    return result
  }

  async corehuayplus () {
    const url = 'https://api.corehuayplus.com/api/auth/signin'
    const { username, password } = Config.get(`lotteryAuth.corehuayplus`)

    const loginObj = {
      username: username,
      password: password
    }

    const options = {
      method: 'POST',
      uri: url,
      body: loginObj,
      json: true
    }

		const result = await BrowserRepository.request(options)
    await this.Redis.set(`cookie:corehuayplus`, JSON.stringify(result.token), 'EX', this.authExpire)

    return result
  }

  async tamjaibet () {
    const url = 'https://tam222.com/api/authentication/login'
    const { username, password } = Config.get(`lotteryAuth.tamjaibet`)

    const loginObj = {
      username: username,
      password: password
    }

    const options = {
      method: 'POST',
      uri: url,
      body: loginObj,
      json: true
    }

		const result = await BrowserRepository.request(options)
    await this.Redis.set(`cookie:tamjaibet`, JSON.stringify(result.accessToken), 'EX', this.authExpire)

    return result
  }

	async worldlotto() {
		const url = 'https://ct1bet.com/api/v1/public/members/login'
    const { username, password } = Config.get(`lotteryAuth.worldlotto`)

    const loginObj = {
      username: username,
      password: password
    }

    const options = {
      method: 'POST',
      uri: url,
      body: loginObj,
      json: true
    }

		const result = await BrowserRepository.request(options)
    await this.Redis.set(`cookie:worldlotto`, JSON.stringify({ accessToken: result.data.access_token }), 'EX', this.authExpire)

    return result
	}

	async chudjen() {
		const url = 'https://chudjenbet.net/auth/login'
    const { username, password } = Config.get(`lotteryAuth.chudjen`)

    const loginObj = {
      username: username,
      password: password
    }

    const options = {
      method: 'POST',
      uri: url,
      body: loginObj,
      json: true
    }

		const result = await BrowserRepository.request(options)
    await this.Redis.set(`cookie:chudjen`, JSON.stringify({ accessToken: result.data.token }), 'EX', this.authExpire)

    return result
	}
}

module.exports = ResultAuthRepository
