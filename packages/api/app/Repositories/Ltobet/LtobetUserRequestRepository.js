'use strict'

const _ = use('lodash')
const moment = use('moment')
const Helper = use('App/Helper')
const rp = use('request-promise')
const puppeteer = use('puppeteer')
const Redis = use('Redis')

class LtobetUserRequestRepository {

  static get inject() {
    return [
      'App/Repositories/Ltobet/LtobetUserRepository',
      'App/Repositories/Ltobet/LtobetUserAffliateRepository',
      'App/Repositories/Ltobet/LtobetUserRevenueRepository',
    ]
  }

  constructor(LtobetUserRepository, LtobetUserAffliateRepository, LtobetUserRevenueRepository) {
    this.LtobetUserRepository = LtobetUserRepository
    this.LtobetUserAffliateRepository = LtobetUserAffliateRepository
    this.LtobetUserRevenueRepository = LtobetUserRevenueRepository
  }
  async request (options) {

    const result = await rp(options)
    .then(function (response) {
      return response
    })
    .catch(function (error) {
      return error
    })
    
    return result
	}

  async requestUserProfile(jwtToken) {
    const url = `https://www.ltobet.com/api/account/`
    const options = {
      method: 'GET',
      uri: url,
			headers: {
				authorization: jwtToken
			},
      json: true
    }

		const result = await this.request(options)
    return result
  }

  async requestLtobetLogin(username, password) {
    const browser = await puppeteer.launch({ 
      headless: "true" ,  
      args: [
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--disable-setuid-sandbox",
        "--no-sandbox"
      ]
    });

    try {
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36')
      await page.setViewport({ width: 1080, height: 1024 });

      await page.goto('https://www.ltobet.com', {
        waitUntil: 'load',
        timeout: 5000
      });

      await page.waitForSelector('input#username', { timeout: 5000 });
      await page.type('input#username', username)
      await page.type('input#password', password)
      await page.click('form button')
      await page.waitForNavigation({ 
        waitUntil: 'networkidle0',
        timeout: 5000
      });

      const successUrl = 'https://www.ltobet.com/member'
      const cuurentPageUrl = await page.url()

      if (cuurentPageUrl != successUrl) {
        await browser.close()
        return false
      }

      const cookie = await page.cookies()

      return cookie
    } catch (e) {
      // console.log(e);
      if (browser) await browser.close()
    } finally {
      if (browser) await browser.close()
    }
  }

  async reloginTokenExpired(ltoUserId) {
    const filters = {
      select: [
        'username',
        'password'
      ],
      lto_user_id: ltoUserId
    }

    let user = await this.LtobetUserRepository.browse(filters).first()
    if (user) {
      user = user.toJSON()
      await this.ltoUserLogin(user.username, user.password)
    }
  }

  async requestUserAffliate(ltoUserId, jwtToken) {
    const url = `https://www.ltobet.com/api/member/affiliate`
    const options = {
      method: 'GET',
      uri: url,
			headers: {
				authorization: jwtToken
			},
      json: true
    }

		const result = await this.request(options)
    const status = _.get(result, 'statusCode') || null
    if (status === 401) {
      await this.reloginTokenExpired(ltoUserId)
      return false
    }

    return result
  }

  async ltoUserLogin(username, password) {
    const cookie = await this.requestLtobetLogin(username, password)
    if (cookie) {
      const authCookie = _.filter(cookie, { name: 'auth._token.local'}) || null
      let jwtToken = _.get(authCookie, '0.value') || null
      jwtToken = _.replace(jwtToken, '%20', ' ')
      await this.getUserProfile(jwtToken)
      return true
    }

    return false
  }

  async getUserAffliate(ltoUserId, jwtToken) {

    const today = moment().format('YYYY-MM-DD')
    const yesterday = moment().add(-1 , 'day').format('YYYY-MM-DD')
    let data = await this.requestUserAffliate(ltoUserId, jwtToken)
    if (data) {
      data = _.pick(data, [
        'total_bet_af',
        'total_members', 
        'total_revenue_af',
        'total_members_today',
        'current_revenue'
      ])

      data = _.mapKeys(data, (value, key) => {
        if (key === 'total_bet_af') return 'downline_bet_all'
        if (key === 'total_members') return 'downline_count'
        if (key === 'total_revenue_af') return 'total_revenue'
        if (key === 'total_members_today') return 'incoming_member'
        return key
      })

      let currentAmount = _.get(data, 'total_revenue') || 0.00
      currentAmount = parseFloat(currentAmount)

      let currentMember = _.get(data, 'downline_count')
      currentMember = parseInt(currentMember)

      
      _.assign(data, { 
        lto_user_id: ltoUserId ,
        date: today,
        amount: currentAmount
      })

      let cacheRevenue = await Redis.get(`ltobet:user:${ltoUserId}:revenue:${yesterday}`)
      if (cacheRevenue) {
        cacheRevenue = JSON.parse(cacheRevenue)
        _.assign(data, {
          amount: currentAmount - parseFloat(cacheRevenue.revenue),
          incoming_member: currentMember - parseInt(cacheRevenue.incoming_member)
        })
      } else {
        let affliate = await this.LtobetUserAffliateRepository.findBy('lto_user_id', ltoUserId)
        affliate = affliate.toJSON()
        _.assign(data, {
          amount: currentAmount - parseFloat(affliate.total_revenue),
          incoming_member: currentMember - parseInt(affliate.downline_count)
        })
      }

      const affliateResponse = await this.LtobetUserAffliateRepository.createOrUpdate(data)
      const revenueResponse = await this.LtobetUserRevenueRepository.createOrUpdate(data)
    }
  }

  async getUserProfile(jwtToken) {
    const userProfile = await this.requestUserProfile(jwtToken)
    const profile = _.mapKeys(userProfile, (value, key) => {
      if(key === 'id') return 'lto_user_id'
      return key
    })
    
    let user = await this.LtobetUserRepository.createOrUpdate(_.assign(profile, { jwt_token: jwtToken }))
  }
}

module.exports = LtobetUserRequestRepository
