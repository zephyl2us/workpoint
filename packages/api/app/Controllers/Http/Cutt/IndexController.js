'use strict'

const md5 = require('md5')

const _ = use('lodash')
const moment = use('moment')
const Env = use('Env')
const Redis = use('Redis')
const Pusher = use('Pusher')
const UAParser = require('ua-parser-js')
const geoip = require('geoip-lite')
const LogRepository = make('App/Repositories/LogRepository')
// const BullTestJob = use('App/Jobs/BullTest')

class IndexController {
  constructor() {
    this.Redis = Redis.connection('temp')
    this.cacheDuration = 86400
  }

	async index ({ request, response, view }) {

    const requestUrl = _.replace(request.url(), '/', '')

    const redirectUrl = {
      'fGGEq9V7k1': `https://bit.ly/49DFbEN`, // LINE @
      // 'thG7fbSThS'
      // '99Yo1pFKZx'
      // 'AsdsHiEhfg'
      // 'fJqpFxLvZK'
      // 'btJUzHmEkV'
      // 'gRRZj2esDv'
    }

    // console.log(requestUrl)

    if (_.has(redirectUrl, requestUrl)) {
      const clientData = await this.getClientData(request)
      // console.log(clientData)
      
      const dataLogs = {
        title: 'Cutt',
        path: 'app/Cutt',
        channel: 'kue',
        message: `Access: `,
        data: { clientData },
      }
      LogRepository.fire(dataLogs)
      const url = _.get(redirectUrl, requestUrl)

      return response.status(301).redirect(url)
    }

    if (_.eq(requestUrl, '4SXfET8E9o')) {
      const clientData = await this.getClientData(request)

      const dataLogs = {
        title: 'Cutt',
        path: 'app/Cutt',
        channel: 'kue',
        message: `Test Access: `,
        data: { clientData },
      }
      LogRepository.fire(dataLogs)
    }

    return view.render('cutt.landing')
  }

  async getClientData (request) {
    const uaString = request.header('user-agent')
    const parser = new UAParser(uaString)
    const uaResult = parser.getResult()

    const ip = request.clientIp
    
    const geo = geoip.lookup(ip) || {}

    const clientData = {
      user_agent: uaString,
      device_info: {
        browser: `${uaResult.browser.name} ${uaResult.browser.version}`,
        os: `${uaResult.os.name} ${uaResult.os.version}`,
        device_type: uaResult.device.type || 'desktop', // mobile, tablet, console
        device_model: `${uaResult.device.vendor || ''} ${uaResult.device.model || ''}`.trim(),
        cpu_arch: uaResult.cpu.architecture
      },

      network_info: {
        ip_address: ip,
        country: geo.country || 'Unknown',
        city: geo.city || 'Unknown',
        timezone: geo.timezone || '',
        isp_org: request.header('cf-ipcountry') ? 'Cloudflare' : 'Unknown' // ตัวอย่างถ้าใช้ CF
      },

      traffic_info: {
        url: request.url(),
        method: request.method(),
        referer: request.header('referer') || 'Direct',
        query_params: request.get(),
      },

      timestamp: new Date()
    }

    return clientData
  }
}

module.exports = IndexController
