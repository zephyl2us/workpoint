'use strict'

const _ = use('lodash')
const moment = use('moment')
const Env = use('Env')
const Config = use('Config')
const CryptoJS = use("crypto-js")

const passPhrase = `ใกล้แล้วค่ะ เอาให้ผ่าน สู้ๆนะ :)`

class Movie {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ auth, guard, request, response, params }, next, properties) {
		const ip = request.header('cf-connecting-ip') || request.ip()

    let isProduction = false
    let isDevelopment = !Env.getOrFail('NODE_ENV') !== 'production'

    
    // Core Private Ip
    const privateIps = [
      '10.104.16.3',
      '10.104.16.4'
    ]

    // console.log(request.headers())

    if(_.includes(privateIps, request.header('host'))) {
      isProduction = true
    }

    // if(request.header('cf-connecting-ip') && request.header('cf-ray')) {
    //   isProduction = true
    // }

    let hostname = null
    if(isProduction || isDevelopment) {
      hostname = params.domain
    } else {
      let referer = request.header('referer')
      referer = _.replace(referer, `https://`, '')
      referer = _.replace(referer, `http://`, '')
      referer = _.replace(referer, `.local`, '')
      referer = _.split(referer, `/`)[0]
      referer = _.split(referer, `:`)[0]
  
      hostname = referer
    }
    const hash = request.header('Agent-Secret')

    if(!hash) {
      return response.status(401).send(`Invalid Domain - Your IP : ${ip} is saved.`)
    }

    const bytes = CryptoJS.AES.decrypt(hash, passPhrase)
    const agentSecret = bytes.toString(CryptoJS.enc.Utf8)

    const currentTime = moment().unix()
    if(agentSecret < (currentTime - 10)) {
      return response.status(401).send(`Invalid Domain - Your IP : ${ip} is saved.`)
    }

    const siteConfig = Config.get('movie.siteConfig')
    const site = _.find(siteConfig, ['domain', hostname])

    const isEnable = _.get(site, 'enable') === true

    if(!isEnable) {
      return response.status(401).send(`Invalid Domain - Your IP : ${ip} is saved.`)
    }

    await next()
  }
}

module.exports = Movie
