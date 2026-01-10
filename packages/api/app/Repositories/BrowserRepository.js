'use strict'

const _ = use('lodash')
const Bull = use('Bull')
const Config = use('Config')
const moment = use('moment')
const rp = use('request-promise')
const proxyChain = require('proxy-chain')
// const puppeteer = use('puppeteer')
const Helper = use('App/Helper')
const LogRepository = make('App/Repositories/LogRepository')

const puppeteer = use('puppeteer-extra') 
const StealthPlugin = use('puppeteer-extra-plugin-stealth') 
const { executablePath } = use('puppeteer') 


class BrowserRepository {

  static get inject() {
    return []
  }

  constructor() {
    this.closeBrowserDelay = 100
  }

  async launchArgs () {
    const launchArgs = [
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--disable-setuid-sandbox",
      "--no-sandbox"
    ]

    const privateProxy = Helper.privateProxy()
    if(privateProxy) {
      // console.log(`privateProxy`)
      const proxyUrl = await proxyChain.anonymizeProxy(privateProxy)
      if(Helper.isDebugJob()) console.log(`Proxy`, proxyUrl)
      launchArgs.push(`--proxy-server=${proxyUrl}`)
    }
    
    // console.log(launchArgs)

    return launchArgs
  }

  async puppeteer (url, options = {}, callback) {
    if(Helper.isDebugJob()) console.log(`Puppeteer`, url)
    const startAt = moment().unix()

    puppeteer.use(StealthPlugin())

    const launchArgs = await this.launchArgs()
    const browser = await puppeteer.launch({ 
      headless: "false",
      executablePath: executablePath(),
      args: launchArgs
    })

    // console.log(url, this.launchArgs())
		const page = await browser.newPage();

    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 5.1; rv:5.0) Gecko/20100101 Firefox/5.0')
      await page.setViewport({ width: 1080, height: 1024 })

      const cookie = _.get(options, 'cookie')
      if(cookie && _.isArray(cookie)) {
        await page.setCookie(...cookie)
      }

      await page.goto(url, {
        waitUntil: _.get(options, 'wait_until', 'load'),
        timeout: 10000
      })


      const callbackAt = moment().unix()
      const result = await callback(page)

      const endAt = moment().unix()
      const callbackTime = endAt - callbackAt
      const processTime = endAt - startAt

      return {
        start_at: startAt,
        callback_at: callbackAt,
        callback_time: callbackTime,
        end_at: endAt,
        process_time: processTime,
        data: result
      }

    } catch (e) {
			const dataLogs = {
				title: 'pupperteer',
				path: 'app/Repositories/BrowserRepositories',
				channel: 'browser',
				message: e.message,
				data: e,
        url: url
				// params: data
			}
			LogRepository.fire(dataLogs)
    } finally {
			if (page) {
				await page.close();
        await new Promise(r => setTimeout(r, this.closeBrowserDelay))
			}

      if (browser) {
        await browser.close()
        await new Promise(r => setTimeout(r, this.closeBrowserDelay))
      }
    }

  }

  async request (options) {
    if(Helper.isDebugJob()) console.log(`Request`, _.get(options, 'uri'))

    const privateProxy = Helper.privateProxy()
		let proxyUrl = null
    if(privateProxy) {
      proxyUrl = await proxyChain.anonymizeProxy(privateProxy)
      if(Helper.isDebugJob()) console.log(`Proxy`, proxyUrl)
      options.proxy = proxyUrl
    }

    const result = await rp(options)
    .then(function (response) {
      return response
    })
    .catch(function (error) {
      return error
    })

		// console.log(result)

		if (proxyUrl) {
			await proxyChain.closeAnonymizedProxy(proxyUrl, true)
		}
		
    return result
	}

}

module.exports = BrowserRepository
