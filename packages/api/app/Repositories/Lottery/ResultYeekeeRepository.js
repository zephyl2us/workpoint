'use strict'

const _ = use('lodash')
const moment = use('moment')
const md5 = use('md5')
const Config = use('Config')
const Redis = use('Redis')
const Helper = use('App/Helper')
const BrowserRepository = make('App/Repositories/BrowserRepository')

class ResultYeekeeRepository {

  static get inject() {
    return []
  }

  constructor() {
    this.Redis = Redis.connection('lottery')
  }

  async thaigov(date) {

    const newDateFormat = moment(date).add(543, 'years').format('DDMMYYYY')
    const url = `https://news.sanook.com/lotto/check/${newDateFormat}`
    const options = {
      wait_until: 'domcontentloaded'
    }
    const result = await BrowserRepository.puppeteer(url, options, async(page) => {

      await page.waitForSelector('.lottocheck__sec .lottocheck__column:nth-child(1) strong', { timeout: 5000 });
      const jackpot = await page.$$('.lottocheck__sec .lottocheck__column:nth-child(1) strong')
      const sideJackpot = await page.$$('.lottocheck__sec--nearby strong')
      const frontThree = await page.$$('.lottocheck__sec .lottocheck__column:nth-child(2) strong')
      const backThree = await page.$$('.lottocheck__sec .lottocheck__column:nth-child(3) strong')
      const backTwo = await page.$$('.lottocheck__sec .lottocheck__column:nth-child(4) strong')
      const secondRewards = await page.$$('.lottocheck__sec:nth-child(2) span.lotto__number')
      const thirdRewards = await page.$$('.lottocheck__sec:nth-child(3) span.lotto__number')
      const forthRewards = await page.$$('.lottocheck__sec:nth-child(5) span.lotto__number')
      const fifthRewards = await page.$$('.lottocheck__sec:nth-child(7) span.lotto__number')

      const rewards = {
        jackpot_reward: _.first(await this.getResultForThaiGov(jackpot)),
        jackpot_side_rewards: await this.getResultForThaiGov(sideJackpot),
        three_front_rewards: _.isEmpty(backTwo) ? [] : await this.getResultForThaiGov(frontThree),
        three_back_rewards: _.isEmpty(backTwo) ? await this.getResultForThaiGov(frontThree) : await this.getResultForThaiGov(backThree),
        two_back_reward: _.isEmpty(backTwo) ? _.first(await this.getResultForThaiGov(backThree)) : _.first(await this.getResultForThaiGov(backTwo)),
        second_rewards: await this.getResultForThaiGov(secondRewards),
        third_rewards: await this.getResultForThaiGov(thirdRewards),
        forth_rewards: await this.getResultForThaiGov(forthRewards),
        fifth_rewards: await this.getResultForThaiGov(fifthRewards),
      }

      if (_.isEmpty(_.get(rewards, 'three_front_rewards'))) return _.omit(rewards, 'three_front_rewards')
      return rewards
    })

    return _.get(result, 'data') || null
  }

  async ruamchoke(date) {

    let cookie = await this.Redis.get(`cookie:ruamchoke`)
    if (!cookie) {
      return false
    }

    cookie = JSON.parse(cookie)

    const unixDate = moment(date).unix()
    const url = `https://app.ruamchoke.com/?subaction=loadreward&date=${unixDate}`
    const options = {
      cookie: cookie
    }

    const result = await BrowserRepository.puppeteer(url, options, async(page) => {

      await page.waitForSelector('#yeekee div.pc-view div.border-secondary', { timeout: 5000 });
      const yeekeeList = await page.$$('#yeekee div.pc-view div.border-secondary')

      const yeekeeRecords = await this.getResultForChoke(yeekeeList)

      const data = {
        ruamchoke_yeekee: yeekeeRecords,
      }

      return data
    })

    return _.get(result, 'data') || null
  }

  async ruaychoke(date) {

    let cookie = await this.Redis.get(`cookie:ruaychoke`)
    if (!cookie) {
      return false
    }

    cookie = JSON.parse(cookie)

    const unixDate = moment(date).unix()
    const url = `https://www.ruaychoke.com/?subaction=loadreward&date=${unixDate}`
    const options = {
      cookie: cookie
    }

    const result = await BrowserRepository.puppeteer(url, options, async(page) => {

      await page.waitForSelector('#yeekee div.pc-view div.border-secondary', { timeout: 5000 });
      const yeekeeList = await page.$$('#yeekee div.pc-view div.border-secondary')

      const yeekeeRecords = await this.getResultForChoke(yeekeeList)

      const data = {
        ruaychoke_yeekee: yeekeeRecords,
      }

      return data
    })

    return _.get(result, 'data') || null
  }

  async haichoke(date) {

    let cookie = await this.Redis.get(`cookie:haichoke`)
    if (!cookie) {
      return false
    }

    cookie = JSON.parse(cookie)

    const unixDate = moment(date).unix()
    const url = `https://www.haichoke.vip/?subaction=loadreward&date=${unixDate}`
    const options = {
      cookie: cookie
    }

    const result = await BrowserRepository.puppeteer(url, options, async(page) => {

      await page.waitForSelector('#yeekee div.pc-view div.border-secondary', { timeout: 5000 });
      const yeekeeList = await page.$$('#yeekee div.pc-view div.border-secondary')

      const yeekeeRecords = await this.getResultForChoke(yeekeeList)

      const data = {
        haichoke_yeekee: yeekeeRecords,
      }

      return data
    })

    return _.get(result, 'data') || null
  }

  async jakchoke(date) {

    let cookie = await this.Redis.get(`cookie:jakchoke`)
    if (!cookie) {
      return false
    }

    cookie = JSON.parse(cookie)

    const unixDate = moment(date).unix()
    const url = `https://www.jakchoke.com/?subaction=loadreward&date=${unixDate}`
    const options = {
      cookie: cookie
    }

    const result = await BrowserRepository.puppeteer(url, options, async(page) => {

      await page.waitForSelector('#yeekee div.pc-view div.border-secondary', { timeout: 5000 });
      const yeekeeList = await page.$$('#yeekee div.pc-view div.border-secondary')

      const yeekeeRecords = await this.getResultForChoke(yeekeeList)

      const data = {
        jakchoke_yeekee: yeekeeRecords,
      }

      return data
    })

    return _.get(result, 'data') || null
  }

  async taweechoke(date) {

    let cookie = await this.Redis.get(`cookie:taweechoke`)
    if (!cookie) {
      return false
    }

    cookie = JSON.parse(cookie)

    const unixDate = moment(date).unix()
    const url = `https://www.taweechok.com/?subaction=loadreward&date=${unixDate}`
    const options = {
      cookie: cookie
    }

    const result = await BrowserRepository.puppeteer(url, options, async(page) => {

      // console.log(await page.content())
      await page.waitForSelector('#yeekee div.pc-view div.border-secondary', { timeout: 5000 });
      const yeekeeList = await page.$$('#yeekee div.pc-view div.border-secondary')

      const yeekeeRecords = await this.getResultForChoke(yeekeeList)

      const data = {
        taweechok_yeekee: yeekeeRecords,
      }

      return data
    })

    return _.get(result, 'data') || null
  }

  async lottovip(date) {

    let cookie = await this.Redis.get(`cookie:lottovip`)
    if (!cookie) {
      return false
    }

    cookie = JSON.parse(cookie)

    const unixDate = moment(date).valueOf()
    const url = `https://www.lottovip.com/member/result/all/${unixDate}`
    const options = {
      cookie: cookie
    }

    const result = await BrowserRepository.puppeteer(url, options, async(page) => {

      await page.waitForSelector('#yeekee div.pc-view div.border-secondary', { timeout: 5000 });
      const yeekeeList = await page.$$('#yeekee div.pc-view div.border-secondary')

      let results = []
      for (const i in yeekeeList) {
        const record = yeekeeList[i]
        const threeTop = await record.$eval('div:last-child > div > div.card:first-child > div:last-child > p', number => number.textContent.replace(/[\Wa-zA-Z]/g, ''))
        const twoUnder = await record.$eval('div:last-child > div > div.card:last-child > div:last-child > p', number => number.textContent.replace(/[\Wa-zA-Z]/g, ''))
        const data = {
          round: parseInt(i) + 1,
          three_top: threeTop ? threeTop : null,
          two_top: threeTop ? threeTop.slice(-2) : null,
          two_under: twoUnder ? twoUnder : null
        }

        results.push(data)
      }
      results = _.sortBy(results, ['round'])

      const yeekeeRecords = {
        lottovip_yeekee: results,
      }

      return yeekeeRecords
    })

    return _.get(result, 'data') || null
  }

  async luxnumber(date) {
    let cookie = await this.Redis.get('cookie:luxnumber')
    if (!cookie) {
      return false
    }

    cookie = JSON.parse(cookie)

    const token = _.get(cookie, 'data.access_token')
    const url = `https://www.luxnumber.com/lapi/bet/reward?${date}`
    const options = {
      method: 'GET',
      uri: url,
      headers: {
        Authorization: `Bearer ${token}`
      },
      json: true,
    }

    const result = await BrowserRepository.request(options)
    const yeekeeRecords = _.get(result, 'data.yeekee.reward')

    let results = []
    _.each(yeekeeRecords, (record) => {
      const round = parseInt(_.get(record, 'round'))
      const number = _.get(record, 'prize.0.number') || null
      if (number) {
        const threeTop = number.substring(2) || null
        const twoTop = threeTop ? threeTop.slice(-2) : null
        const twoUnder = number.substring(0, 2)

        const data = {
          round: round,
          three_top: threeTop,
          two_top: twoTop,
          two_under: twoUnder
        }
        results.push(data)
      }
    })

    results = _.sortBy(results, ['round'])

    return {
      luxnumber_yeekee: results,
    }
  }

  async cat888(date) {

    let cookie = await this.Redis.get(`cookie:cat888`)
    if (!cookie) {
      return false
    }

    cookie = JSON.parse(cookie)
      // const url = `https://cat888.fun/online/yeekee/history?searching_date=${date}`

    const url = `https://cat888.co/online/yeekee/history?searching_date=${date}`
    const options = {
      cookie: cookie
    }

    const result = await BrowserRepository.puppeteer(url, options, async(page) => {

      await page.waitForSelector('#user div div.form-row div table tbody tr', { timeout: 5000 });
      const yeekee5minList = await page.$$('#user div div.form-row div table tbody tr')
      const yeekeeRecords = await this.getResultForCat(yeekee5minList)

      return {
        cat888_5min_vip: yeekeeRecords
      }
    })

    return _.get(result, 'data') || null
  }

  async cat999(date) {

    const url = `https://cat999.co/online/yeekee/history?searching_date=${date}`
    const options = {}

    const result = await BrowserRepository.puppeteer(url, options, async(page) => {

      await page.waitForSelector('#user div div.form-row div table tbody tr', { timeout: 5000 });
      const yeekee5minList = await page.$$('#user div div.form-row div table tbody tr')
      const yeekeeRecords = await this.getResultForCat(yeekee5minList)

      return {
        cat999_5min_vip: yeekeeRecords
      }
    })

    return _.get(result, 'data') || null
  }

  async movewin(date) {

    let cookie = await this.Redis.get(`cookie:movewin`)
    if (!cookie) {
      return false
    }

    cookie = JSON.parse(cookie)

    const newFormatDate = moment(date).add(543, 'year').format('DD/MM/YYYY')
    const url = `https://edcstudio.live/member/result?date=${newFormatDate}`
    const options = {
      cookie: cookie
    }

    const result = await BrowserRepository.puppeteer(url, options, async(page) => {

      const currentUrl = await page.url()
      if (currentUrl !== url) {
        await this.Redis.del(`cookie:movewin`)
        return null
      }

      await page.waitForSelector('#tap-conent-0 div.row.table-row', { timeout: 5000 });
      const yeekeeLists = await page.$$('#tap-conent-0 div.row.table-row')
      const yeekeeVipLists = await page.$$('#tap-conent-8 div.row.table-row')

      const yeekeeRecords = await this.getResultForMovewin(yeekeeLists)
      const yeekeeVipRecords = await this.getResultForMovewin(yeekeeVipLists)

      return {
        movewin_yeekee: yeekeeRecords,
        movewin_yeekee_vip: yeekeeVipRecords
      }
    })

    return _.get(result, 'data') || null
  }

  async uwin789(date) {

    let cookie = await this.Redis.get(`cookie:uwin789`)
    if (!cookie) {
      return false
    }

    cookie = JSON.parse(cookie)

    const newFormatDate = moment(date).format('DD-MMM-YYYY')
    const url = `https://www.uwin789.vip/result/${newFormatDate}`
    const options = {
      cookie: cookie
    }

    const result = await BrowserRepository.puppeteer(url, options, async(page) => {

      await page.waitForSelector('div.pa2px.relative.rd4px.bg-gray', { timeout: 5000 });
      const yeekeeList = await page.$$('div.pa2px.relative.rd4px.bg-gray')

      const yeekeeRecords = await this.getResultForUwin(yeekeeList)

      return {
        uwin789_yeekee: yeekeeRecords,
      }
    })

    return _.get(result, 'data') || null
  }

  async huay9898(date) {

    const url = `https://www.9898huay.com/daily-lotto/`
    const options = {}

    const result = await BrowserRepository.puppeteer(url, options, async(page) => {

      await page.waitForSelector('#iRight #Tb3:first-child tbody tr', { timeout: 5000 });
      const yeekeeList = await page.$$('#iRight #Tb3:first-child tbody tr')
      let results = []
      for (const i in yeekeeList) {
        const record = yeekeeList[i]
        const round = i
        const threeTop = await record.$eval('td:nth-child(2)', number => number.textContent.replace(/[\Wa-zA-Z]/g, ''))
        const twoUnder = await record.$eval('td:nth-child(3)', number => number.textContent.replace(/[\Wa-zA-Z]/g, ''))
        const data = {
          round: parseInt(round) + 1,
          three_top: threeTop ? threeTop : null,
          two_top: threeTop ? threeTop.slice(-2) : null,
          two_under: twoUnder ? twoUnder : null
        }

        results.push(data)
      }
      results = _.sortBy(results, ['round'])

      return {
        huay9898_yeekee: results
      }
    })

    return _.get(result, 'data') || null
  }

  async siamlotto(date) {

    let cookie = await this.Redis.get(`cookie:siamlotto`)
    if (!cookie) {
      return false
    }

    cookie = JSON.parse(cookie)

    const url = `https://member.siamlotto.co/lotto/report?date=${date}`
    const options = {
      cookie: cookie
    }

    const result = await BrowserRepository.puppeteer(url, options, async(page) => {

      await page.waitForSelector('#pills-long  div.card.lotto', { timeout: 5000 });
      const yeekeeList = await page.$$('#pills-long  div.card.lotto')

      let results = []
      for (const i in yeekeeList) {
        const record = yeekeeList[i]
        const round = await record.$eval('div.gold h6', number => number.textContent.replace(/([a-zA-Z]|\W)/g, ''))
        const threeTop = await record.$eval('div.card-body div:first-child h6', number => number.textContent.replace(/[\W\t a-zA-Z]/g, ''))
        const twoUnder = await record.$eval('div.card-body div:last-child h6', number => number.textContent.replace(/[\W\t a-zA-Z]/g, ''))
        const data = {
          round: parseInt(round),
          three_top: threeTop ? threeTop : null,
          two_top: threeTop ? threeTop.slice(-2) : null,
          two_under: twoUnder ? twoUnder : null
        }

        results.push(data)
      }
      results = _.sortBy(results, ['round'])

      return {
        siamlotto_yeekee: results,
      }
    })

    return _.get(result, 'data') || null
  }

  async thailotto(date) {

    const url = `https://thailotto.net/`
    const options = {}

    const result = await BrowserRepository.puppeteer(url, options, async(page) => {

      await page.waitForSelector('#pills-long .box-lotto', { timeout: 5000 });
      const yeekeeLists = await page.$$('#pills-long .box-lotto')
      const yeekee5minList = await page.$$('#pills-long0 .box-lotto')

      const yeekeeRecords = await this.getResultForThailotto(yeekeeLists)
      const yeekee5minRecords = await this.getResultForThailotto(yeekee5minList)

      return {
        thailotto_yeekee: yeekeeRecords,
        thailotto_5min: yeekee5minRecords,
      }
    })

    return _.get(result, 'data') || null
  }

  async huay95(date) {

    const adjustDateFormat = moment(date).format('YYYYMMDD')
    const url = `https://api.xn--95-nsia7btl5aua8wod.net/info/getResult/${adjustDateFormat}`
    const options = {
      method: 'GET',
      uri: url,
      json: true
    }

    const results = await BrowserRepository.request(options)
    const data = _.get(results, 'info')

    const yeekeeRecords = await this.getResultForHeng("YK", data)
    const yeekee5MinRecords = await this.getResultForHeng("YK5", data)

    return {
      huay95_yeekee: yeekeeRecords,
      huay95_5min: yeekee5MinRecords,
    }
  }

  async kklotto(date) {

    const adjustDateFormat = moment(date).format('YYYYMMDD')
    const url = `https://api.kklotto.com/info/getResult/${adjustDateFormat}`
    const options = {
      method: 'GET',
      uri: url,
      json: true
    }

    const results = await BrowserRepository.request(options)
    const data = _.get(results, 'info')

    const yeekeeRecords = await this.getResultForHeng("YK", data)
    const yeekee5MinRecords = await this.getResultForHeng("YK5", data)

    return {
      kklotto_yeekee: yeekeeRecords,
      kklotto_5min: yeekee5MinRecords,
    }
  }

  async jaosuo(date) {

    const adjustDateFormat = moment(date).format('YYYYMMDD')
    const url = `https://api.jaosuo.net/info/getResult/${adjustDateFormat}`
    const options = {
      method: 'GET',
      uri: url,
      json: true
    }

    const results = await BrowserRepository.request(options)
    const data = _.get(results, 'info')

    const yeekeeRecords = await this.getResultForHeng("YK", data)
    const yeekee5MinRecords = await this.getResultForHeng("YK5", data)

    return {
      jaosuo_yeekee: yeekeeRecords,
      jaosuo_5min: yeekee5MinRecords,
    }
  }

  async heng168(date) {

    const adjustDateFormat = moment(date).format('YYYYMMDD')
    const url = `https://api.heng-168.co/info/getResult/${adjustDateFormat}`
    const options = {
      method: 'GET',
      uri: url,
      json: true
    }

    const results = await BrowserRepository.request(options)
    const data = _.get(results, 'info')

    const yeekeeRecords = await this.getResultForHeng("YK", data)
    const yeekee5MinRecords = await this.getResultForHeng("YK5", data)

    return {
      heng168_yeekee: yeekeeRecords,
      heng168_5min: yeekee5MinRecords,
    }
  }

  async huay2525(date) {

    const url = `https://api.huay2525.live/api/home`
    const options = {
      method: 'GET',
      uri: url,
      json: true
    }

    const results = await BrowserRepository.request(options)
    const yeekeeVipRecords = this.getResultForHuay("ppclose.lists", results)

    return {
      huay2525_yeekee_vip: yeekeeVipRecords,
    }
  }

  async rachahuay(date) {

    const url = `https://api.rachahuay.com/api/home`
    const options = {
      method: 'GET',
      uri: url,
      json: true
    }

    const results = await BrowserRepository.request(options)
    const yeekeeVipRecords = this.getResultForHuay("ppclose.lists", results)

    return {
      rachahuay_yeekee_vip: yeekeeVipRecords,
    }
  }

  async masurebet(date) {

    const url = `https://api.masurebet.net/api/home`
    const options = {
      method: 'GET',
      uri: url,
      json: true
    }

    const results = await BrowserRepository.request(options)
    const yeekeeVipRecords = this.getResultForHuay("ppclose.lists", results)

    return {
      masurebet_yeekee_vip: yeekeeVipRecords,
    }
  }

  async settee(date) {

    const url = `https://api.setteebet.bet/api/home`
    const options = {
      method: 'GET',
      uri: url,
      json: true
    }

    const results = await BrowserRepository.request(options)
    const yeekeeVipRecords = this.getResultForHuay("ppclose.lists", results)

    return {
      settee_yeekee_vip: yeekeeVipRecords,
    }
  }

  async jaywaii(date) {

    const url = `https://api.waii.site/api/home`
    const options = {
      method: 'GET',
      uri: url,
      json: true
    }

    const results = await BrowserRepository.request(options)
    const yeekeeVipRecords = this.getResultForHuay("ppclose.lists", results)

    return {
      jaywaii_yeekee_vip: yeekeeVipRecords,
    }
  }

  async kerry899(date) {

    const url = `https://api.kerry899plus.com/api/home`
    const options = {
      method: 'GET',
      uri: url,
      json: true
    }

    const results = await BrowserRepository.request(options)
    const yeekeeVipRecords = this.getResultForHuay("ppclose.lists", results)

    return {
      kerry899_yeekee_vip: yeekeeVipRecords,
    }
  }

  async lottorich28(date) {

    const url = `https://api.lottorich28.co/api/home`
    const options = {
      method: 'GET',
      uri: url,
      json: true
    }

    const results = await BrowserRepository.request(options)
    const yeekeeVipRecords = this.getResultForHuay("ppclose.lists", results)

    return {
      lottorich28_yeekee: yeekeeVipRecords,
    }

    // OLD ONE
    // let cookie = await this.Redis.get(`cookie:lottorich28`)
    // if (!cookie) {
    //   return false
    // }

    // cookie = JSON.parse(cookie)

    // const newFormatDate = moment(date).format('DD-MMM-YYYY')
    // const url = `https://www.lottorich28.co/result/${newFormatDate}`
    // const options = {
    //   cookie: cookie
    // }

    // const result = await BrowserRepository.puppeteer(url, options, async (page) => {

    //   await page.waitForSelector('div.pa2px.relative.rd4px.bg-gray', { timeout: 5000 });
    //   const yeekeeList = await page.$$('div.pa2px.relative.rd4px.bg-gray')

    //   const yeekeeRecords = await this.getResultForUwin(yeekeeList)
    //   return {
    //     lottorich28_yeekee: yeekeeRecords,
    //   }
    // })

    // return _.get(result, 'data') || null
  }

  async yeslotto(date) {
    const resultYeekee = await this.requestYeslotto(date, 'YEEKEE')
    const resultYeekee5min = await this.requestYeslotto(date, 'YEEKEE_5')

    return {
      yeslotto_yeekee: this.getResultForYeslotto(_.get(resultYeekee, 'data')),
      yeslotto_5min: this.getResultForYeslotto(_.get(resultYeekee5min, 'data')),
    }
  }

  async teng1(date) {
    const resultYeekee = await this.requestTengone('YK')
    const resultYeekeeVip = await this.requestTengone('YKVIP')

    return {
      teng1_yeekee: this.getResultForTengone(_.get(resultYeekee, 'data')),
      teng1_yeekee_vip: this.getResultForTengone(_.get(resultYeekeeVip, 'data')),
    }
  }

  async lotto432(date) {
    const url = `https://api66lotto.com/lotto/api/yeekee/prize?date=${date}`
    const options = {
      method: 'GET',
      uri: url,
      json: true,
    }

    const result = await BrowserRepository.request(options)
    const yeekeeRecords = this.getResultForLotto(result)

    return {
      lotto432_yeekee: yeekeeRecords
    }

  }

  async lotto77(date) {
    const url = `https://api77lotto.com/lotto/api/yeekee/prize?date=${date}`
    const options = {
      method: 'GET',
      uri: url,
      json: true,
    }

    const result = await BrowserRepository.request(options)
    const yeekeeRecords = this.getResultForLotto(result)

    return {
      lotto77_yeekee: yeekeeRecords
    }

  }

  async huaylike(date) {
    const resultYeekee = await this.requestHuaylike('powerball')
    const resultYeekee4G = await this.requestHuaylike('powerball4g')
    const resultYeekee5G = await this.requestHuaylike('powerball5g')

    const keyRetrive = 'data.getResultPowerBall.data'

    return {
      huaylike_yeekee: this.getResultForHuaylike(resultYeekee, keyRetrive),
      huaylike_10min: this.getResultForHuaylike(resultYeekee4G, keyRetrive),
      huaylike_5min: this.getResultForHuaylike(resultYeekee5G, keyRetrive),
    }
  }

  async arawanbet(date) {
    const resultYeekee = await this.requestArawanbet(date, 'soidown_15')
    const resultYeekee5min = await this.requestArawanbet(date, 'soidown_5')
    const resultYeekee10min = await this.requestArawanbet(date, 'soidown')

    return {
      arawan_yeekee: this.getResultForArawanbet(resultYeekee),
      arawan_10min: this.getResultForArawanbet(resultYeekee10min),
      arawan_5min: this.getResultForArawanbet(resultYeekee5min),
    }
  }

  async x4rich(date) {
    let cookie = await this.Redis.get(`cookie:x4rich`)
    if (!cookie) {
      return false
    }

    cookie = JSON.parse(cookie)

    // const unixDate = moment(date).unix()
    const url = `https://x4rich.com/home/show_x4.php`
    const urlVip = `https://x4rich.com/home/show_x4_vip.php`
    const options = {
      cookie: cookie
    }

    const yeekeeResult = await BrowserRepository.puppeteer(url, options, async(page) => {

      await page.waitForSelector('.table.table-dark tr', { timeout: 5000 });
      const yeekeeList = await page.$$('.table.table-dark tr')

      let results = []
      for (const obj of yeekeeList) {
        const round = await obj.$eval('td:nth-child(1)', number => number.textContent.replace(/\s/g, ''))
        const threeTop = await obj.$eval('td:nth-child(3)', number => number.textContent.replace(/\s/g, ''))
        const twoUnder = await obj.$eval('td:nth-child(4)', number => number.textContent.replace(/\s/g, ''))

        if (/\W/g.test(twoUnder)) continue;

        const data = {
          round: parseInt(round),
          three_top: threeTop ? threeTop : null,
          two_top: threeTop ? threeTop.slice(-2) : null,
          two_under: twoUnder ? twoUnder : null
        }

        results.push(data)
      }

      const yeekeeRecords = _.sortBy(results, ['round'])

      const data = {
        x4rich_yeekee: yeekeeRecords,
      }

      return data
    })

    const yeekeeVipResult = await BrowserRepository.puppeteer(urlVip, options, async(page) => {

      await page.waitForSelector('.table.table-dark tr', { timeout: 5000 });
      const yeekeeList = await page.$$('.table.table-dark tr')

      let results = []
      for (const obj of yeekeeList) {
        const round = await obj.$eval('td:nth-child(1)', number => number.textContent.replace(/\s/g, ''))
        const threeTop = await obj.$eval('td:nth-child(3)', number => number.textContent.replace(/\s/g, ''))
        const twoUnder = await obj.$eval('td:nth-child(4)', number => number.textContent.replace(/\s/g, ''))

        if (/\W/g.test(twoUnder)) continue;

        const data = {
          round: parseInt(round),
          three_top: threeTop ? threeTop : null,
          two_top: threeTop ? threeTop.slice(-2) : null,
          two_under: twoUnder ? twoUnder : null
        }

        results.push(data)
      }

      const yeekeeRecords = _.sortBy(results, ['round'])

      const data = {
        x4rich_vip: yeekeeRecords,
      }

      return data
    })

    return {
      ..._.get(yeekeeResult, 'data'),
      ..._.get(yeekeeVipResult, 'data')
    }
  }

  async corehuayplus(date) {
    let cookie = await this.Redis.get(`cookie:corehuayplus`)
    if (!cookie) {
      return false
    }

    cookie = JSON.parse(cookie)

    const urlYeekeeId = `https://api.corehuayplus.com/api/YiiGii/getyiigii/`
    const urlYeekeeResult = `https://api.corehuayplus.com/api/YiiGii/getRound`
    const options = {
      method: 'GET',
      uri: urlYeekeeId,
      headers: {
        Authorization: `Bearer ${cookie}`
      },
      json: true
    }

    const yeekeeIdRequest = await BrowserRepository.request(options)
    const yeekeeId = _.get(yeekeeIdRequest, 'yiigii.0._id')

    // Request Result
    options.uri = urlYeekeeResult
    options.method = 'POST'
    const results = await BrowserRepository.request(_.assign(options, { body: { yiiGiiId: yeekeeId } }))
    const yeekeeList = _.get(results, 'round')

    let yeekeeRecords = []
    for (const obj of yeekeeList) {
      const result = _.get(obj, 'result')

      if (!result) continue

      const round = parseInt(_.get(obj, 'name'))
      const threeTop = _.get(result, 'threeTop')
      const twoTop = _.get(result, 'twoTop')
      const twoUnder = _.get(result, 'twoBot')

      const yeekee = {
        round: round,
        three_top: threeTop,
        two_top: twoTop,
        two_under: twoUnder
      }

      yeekeeRecords.push(yeekee)
    }

    return {
      corehuayplus_yeekee: _.sortBy(yeekeeRecords, ['round']),
    }
  }

  async tamjaibet(date) {
    let cookie = await this.Redis.get(`cookie:tamjaibet`)
    if (!cookie) {
      return false
    }

    cookie = JSON.parse(cookie)

    const url = `https://tam222.com/api/lotto/draws?date=${date}`
    const options = {
      method: 'GET',
      uri: url,
      headers: {
        Authorization: `Bearer ${cookie}`
      },
      json: true
    }

    const results = await BrowserRepository.request(options)
    const yeekeeList = _.filter(results, obj => { return obj.lotto.category === 'yeekee' })
    const yeekeeVipList = _.filter(results, obj => { return obj.lotto.category === 'yeekee-123' })

    let yeekeeRecord = []
    let yeekee123Record = []

    for (const obj of yeekeeList) {

      const result = _.get(obj, 'result')
      if (!result) continue

      const round = _.get(obj, 'round')
      const threeTop = _.get(result, 'THREE_DIGITS')
      const twoTop = _.get(result, 'TWO_DIGITS_TOP')
      const twoUnder = _.get(result, 'TWO_DIGITS_UNDER')

      const yeekee = {
        round: round,
        three_top: threeTop,
        two_top: twoTop,
        two_under: twoUnder
      }

      yeekeeRecord.push(yeekee)
    }

    for (const obj of yeekeeVipList) {

      const result = _.get(obj, 'result')
      if (!result) continue

      const round = _.get(obj, 'round')
      const threeTop = _.get(result, 'THREE_DIGITS')
      const twoTop = _.get(result, 'TWO_DIGITS_TOP')
      const twoUnder = _.get(result, 'TWO_DIGITS_UNDER')

      const yeekee = {
        round: round,
        three_top: threeTop,
        two_top: twoTop,
        two_under: twoUnder
      }

      yeekee123Record.push(yeekee)
    }

    return {
      tamjai_yeekee: yeekeeRecord,
      tamjai_123: yeekee123Record
    }
  }

	async worldlotto(date) {
		let cookie = await this.Redis.get(`cookie:worldlotto`)
    if (!cookie) {
      return false
    }

    cookie = JSON.parse(cookie)
    const url = `https://ct1bet.com/api/v1/public/lottery/list-round-result?round_date=${date}`
    const options = {
      method: 'GET',
      uri: url,
      headers: {
        Authorization: `Bearer ${cookie.accessToken}`
      },
      json: true
    }

    const results = await BrowserRepository.request(options)
		const yeekeeResult = results.data['0121'];
		const yeekee5minResult = results.data['0122'];

    let yeekeeRecord = []
    let yeekee5minRecord = []

		for (const roundKey in yeekeeResult) {
			const roundData = yeekeeResult[roundKey];
			if (roundData.result && roundData.result.top_three && roundData.result.bottom_two) {
				const round = roundData.round_number;
				const threeTop = roundData.result.top_three;
				const twoUnder = roundData.result.bottom_two;
				const twoTop = threeTop.slice(-2);

				const yeekee = {
						round: round,
						three_top: threeTop,
						two_top: twoTop,
						two_under: twoUnder
				};
				
				yeekeeRecord.push(yeekee);
			}
		}

		for (const roundKey in yeekee5minResult) {
			const roundData = yeekee5minResult[roundKey];
			if (roundData.result && roundData.result.top_three && roundData.result.bottom_two) {
				const round = roundData.round_number;
				const threeTop = roundData.result.top_three;
				const twoUnder = roundData.result.bottom_two;
				const twoTop = threeTop.slice(-2);

				const yeekee = {
						round: round,
						three_top: threeTop,
						two_top: twoTop,
						two_under: twoUnder
				};
				
				yeekee5minRecord.push(yeekee);
			}
		}

    return {
      worldlotto_yeekee: yeekeeRecord,
      worldlotto_5min: yeekee5minRecord
    }
	}

	async chudjen(date) {
		let cookie = await this.Redis.get(`cookie:chudjen`)
    if (!cookie) {
      return false
    }

    cookie = JSON.parse(cookie)
		const url = `https://chudjenbet.net/api/member/lotto/result/${date}`
		const options = {
      method: 'GET',
      uri: url,
      headers: {
        Authorization: `Bearer ${cookie.accessToken}`
      },
      json: true
    }

    const results = await BrowserRepository.request(options)
		const records = _.get(results, 'records')
		const yeekeeResult = _.filter(records, { type: 'yeekee' });
		const yeekeeVipResult = _.filter(records, { type: 'yeekee_vip' });
		const yeekee5minResult = _.filter(records, { type: 'speed' });
		const yeekeeVip5minResult = _.filter(records, { type: 'speed_vip' });

		return {
			chudjen_yeekee: this.getResultForChudjenbet(_.sortBy(yeekeeResult, ['category_id'])),
			chudjen_yeekee_vip: this.getResultForChudjenbet(_.sortBy(yeekeeVipResult, ['category_id'])),
			chudjen_5min: this.getResultForChudjenbet(_.sortBy(yeekee5minResult, ['category_id'])),
			chudjen_5min_vip: this.getResultForChudjenbet(_.sortBy(yeekeeVip5minResult, ['category_id'])),
		}
	}



  /* 
   * ========================================================================
   * Request Yeslotto, Tengone, Huaylike, Arawanbet
   * ========================================================================
   */

  async requestYeslotto(date, type) {
    let cookie = await this.Redis.get('cookie:yeslotto')
    if (!cookie) return
    cookie = JSON.parse(cookie)
    const url = `https://yeslotto.com/api/draw-board?type=${type}&date=${date}`

    const options = {
      method: 'GET',
      headers: {
        'Token': _.get(cookie, 'token')
      },
      uri: url,
      json: true
    }

    const result = await BrowserRepository.request(options)
    return result
  }

  async requestTengone(param) {
    const url = `https://api.teng1.com/api/inquiryYeekiByType`

    const options = {
      method: 'POST',
      uri: url,
      json: true,
      body: {
        yeekiType: param
      }
    }

    const result = await BrowserRepository.request(options)
    return result
  }

  async requestHuaylike(param) {
    const url = `https://huaylike.life/ms`

    const options = {
      method: 'POST',
      uri: url,
      json: true,
      json: {
        "operationName": "getResultPowerBall",
        "variables": {
          "data": {
            "code": `${param}`
          }
        },
        "query": "query getResultPowerBall($data: InputGetResultPowerBall!) {  getResultPowerBall(data: $data) {data {roundSeq bon3 bon2 lang2}}}"
      }
    }

    const result = await BrowserRepository.request(options)
    return result
  }

  async requestArawanbet(date, type) {
    const url = `https://arawanhd.com/api/lotto/reward/${type}/${date}`

    const options = {
      method: 'GET',
      uri: url,
      json: true,
    }

    const result = await BrowserRepository.request(options)
    return result
  }

  /* 
   * ========================================================================
   * Get result for Huay2525, Rachahuay, Masurebet, Settee, Jaywaii, Kerry899
   * ========================================================================
   */

  getResultForHuay(key, obj) {
    const records = _.get(obj, key) || null

    let results = []
    _.each(records, (record, i) => {
      const result = record
      const round = i + 1
      const threeTop = _.get(result, 'RESULT_3UP') || null
      const twoTop = threeTop ? threeTop.slice(-2) : null
      const twoUnder = _.get(result, 'RESULT_2DOWN') || null

      const data = {
        round: round,
        three_top: threeTop,
        two_top: twoTop,
        two_under: twoUnder
      }

      results.push(data)
    })

    results = _.sortBy(results, ['round'])

    return results
  }

  /* 
   * ===================================================================
   * Get result for Ruamchoke, Ruaychoke, Haichoke, Jakchoke, Taweechoke
   * ===================================================================
   */

  async getResultForChoke(obj) {
    let results = []
    for (const i in obj) {
      const list = obj[i]
      const round = await list.$eval('div:first-child', number => number.textContent.replace(/\W/g, ''))
      const threeTop = await list.$eval('div:last-child > div > div.card:first-child > div:last-child > p', number => number.textContent.replace(/\W/g, ''))
      const twoUnder = await list.$eval('div:last-child > div > div.card:last-child > div:last-child > p', number => number.textContent.replace(/\W/g, ''))
      const data = {
        round: parseInt(round),
        three_top: threeTop ? threeTop : null,
        two_top: threeTop ? threeTop.slice(-2) : null,
        two_under: twoUnder ? twoUnder : null
      }

      results.push(data)
    }
    results = _.sortBy(results, ['round'])

    return results
  }

  /* 
   * ==============================
   * Get result for Heng168, Jaosuo, Kklotto, Online95
   * ==============================
   */

  async getResultForHeng(key, obj) {
    const records = _.filter(obj, { productCode: key })

    let results = []
    _.each(records, (record) => {
      const result = record
      const round = parseInt(_.get(record, 'ykRound'))
      const threeTop = _.get(result, 'award1') !== 'xxx' ? _.get(result, 'award1') : null || null
      const twoTop = threeTop ? threeTop.slice(-2) : null
      const twoUnder = _.get(result, 'award2') !== 'xx' ? _.get(result, 'award2') : null || null

      const data = {
        round: round,
        three_top: threeTop,
        two_top: twoTop,
        two_under: twoUnder
      }

      results.push(data)
    })

    results = _.sortBy(results, ['round'])

    return results
  }

  /* 
   * ====================================
   * Get result for Lottorich28, Uwin789
   * ====================================
   */

  async getResultForUwin(obj) {
    let results = []
    for (const i in obj) {
      const list = obj[i]
      const round = i
      const threeTop = await list.$eval('div.co06m:nth-child(1) .txt-normal', number => number.textContent.trim())
      const twoUnder = await list.$eval('div.co06m:nth-child(2) .txt-normal', number => number.textContent.trim())
      const data = {
        round: parseInt(round) + 1,
        three_top: threeTop ? threeTop : null,
        two_top: threeTop ? threeTop.slice(-2) : null,
        two_under: twoUnder ? twoUnder : null
      }

      results.push(data)
    }
    results = _.sortBy(results, ['round'])

    return results
  }

  /* 
   * ==============================
   * Get result for Cat888, Cat999
   * ==============================
   */

  async getResultForCat(obj) {
    let results = []
    for (const i in obj) {
      const record = obj[i]
      const round = await record.$eval('td:nth-child(1) span', number => number.textContent)
      const threeTop = await record.$eval('td:nth-child(3) span', number => number.textContent.replace(/\W/g, ''))
      const twoUnder = await record.$eval('td:nth-child(4) span', number => number.textContent.replace(/\W/g, ''))
      const data = {
        round: parseInt(round),
        three_top: threeTop ? threeTop : null,
        two_top: threeTop ? threeTop.slice(-2) : null,
        two_under: twoUnder ? twoUnder : null
      }

      results.push(data)
    }
    results = _.sortBy(results, ['round'])

    return results
  }

  /* 
   * ========================================================================
   * Get result for Lotto432, Lotto77
   * ========================================================================
   */

  getResultForLotto(obj) {

    let results = []
    _.each(obj, (record) => {
      const result = record
      const round = parseInt(_.get(record, 'index'))
      const threeTop = _.get(result, 'topThree') !== 'XXX' ? _.get(result, 'topThree') : null || null
      const twoTop = threeTop ? threeTop.slice(-2) : null
      const twoUnder = _.get(result, 'bottomTwo') !== 'XX' ? _.get(result, 'bottomTwo') : null || null

      const data = {
        round: round,
        three_top: threeTop,
        two_top: twoTop,
        two_under: twoUnder
      }

      results.push(data)
    })

    results = _.sortBy(results, ['round'])

    return results
  }

  /* 
   * ========================================================================
   * Get result for ThaiGov
   * ========================================================================
   */

  async getResultForThaiGov(obj) {
    let results = []
    for (const i in obj) {
      const record = obj[i]
      const data = await record.evaluate(el => el.textContent)
      results.push(data)
    }
    return results
  }

  /* 
   * ========================================================================
   * Get other result
   * ========================================================================
   */

  async getResultForMovewin(obj) {
    let results = []
    for (const i in obj) {
      const list = obj[i]
      const threeTop = await list.$eval('div:nth-child(2) > strong ', number => number.textContent.replace(/[\W\t \n]/g, ''))
      const twoUnder = await list.$eval('div:nth-child(3) > strong', number => number.textContent.replace(/[\W\t \n]/g, ''))
      const data = {
        round: parseInt(i) + 1,
        three_top: threeTop ? threeTop : null,
        two_top: threeTop ? threeTop.slice(-2) : null,
        two_under: twoUnder ? twoUnder : null
      }

      results.push(data)
    }
    results = _.sortBy(results, ['round'])

    return results
  }

  async getResultForThailotto(obj) {
    let results = []
    for (const i in obj) {
      const list = obj[i]
      const threeTop = await list.$eval('.box-inner > div:first-child ', number => number.textContent.replace(/[\W\t \n]/g, ''))
      const twoUnder = await list.$eval('.box-inner > div:last-child ', number => number.textContent.replace(/[\W\t \n]/g, ''))
      const data = {
        round: parseInt(i) + 1,
        three_top: threeTop ? threeTop : null,
        two_top: threeTop ? threeTop.slice(-2) : null,
        two_under: twoUnder ? twoUnder : null
      }

      results.push(data)
    }
    results = _.sortBy(results, ['round'])

    return results
  }

  getResultForYeslotto(obj) {

    let results = []
    _.each(obj, (record, i) => {
      const result = record
      const round = i + 1
      const threeTop = _.get(result, 'prize.numbers[0].number[0]') || null
      const twoTop = _.get(result, 'prize.numbers[2].number[0]') || null
      const twoUnder = _.get(result, 'prize.numbers[3].number[0]') || null

      const data = {
        round: round,
        three_top: threeTop,
        two_top: twoTop,
        two_under: twoUnder
      }

      results.push(data)
    })

    results = _.sortBy(results, ['round'])

    return results
  }

  getResultForTengone(obj) {

    let results = []
    _.each(obj, (record, i) => {
      const result = record
      const round = i + 1
      const threeTop = _.get(result, 'threeDigit') !== 'xxx' ? _.get(result, 'threeDigit') : null || null
      const twoTop = threeTop ? threeTop.slice(-2) : null
      const twoUnder = _.get(result, 'twoDigit') !== 'xx' ? _.get(result, 'twoDigit') : null || null

      const data = {
        round: round,
        three_top: threeTop,
        two_top: twoTop,
        two_under: twoUnder
      }

      results.push(data)
    })

    results = _.sortBy(results, ['round'])

    return results
  }

  getResultForHuaylike(obj, key) {

    const records = _.get(obj, key)

    let results = []
    _.each(records, (record, i) => {
      const result = record
      const round = parseInt(_.get(result, 'roundSeq'))
      const threeTop = _.get(result, 'bon3') !== 'xxx' ? _.get(result, 'bon3') : null || null
      const twoTop = threeTop ? threeTop.slice(-2) : null
      const twoUnder = _.get(result, 'lang2') !== 'xx' ? _.get(result, 'lang2') : null || null

      const data = {
        round: round,
        three_top: threeTop,
        two_top: twoTop,
        two_under: twoUnder
      }

      results.push(data)
    })

    results = _.sortBy(results, ['round'])

    return results
  }

  getResultForArawanbet(obj) {

    let results = []
    _.each(obj, (record) => {
      const result = record
      const rawRound = _.get(result, 'readable_edition') || null
      const rawThreeTop = _.filter(result.results, { result_key: '3upper' }) || null
      const rawTwoUnder = _.filter(result.results, { result_key: '2under' }) || null

      const round = parseInt(/\w+/.exec(rawRound)) || null
      const threeTop = _.get(rawThreeTop, '0.result_value') || null
      const twoTop = threeTop ? threeTop.slice(-2) : null
      const twoUnder = _.get(rawTwoUnder, '0.result_value') || null

      const data = {
        round: round,
        three_top: threeTop,
        two_top: twoTop,
        two_under: twoUnder
      }

      results.push(data)
    })

    results = _.sortBy(results, ['round'])

    return results
  }

	getResultForChudjenbet(obj) {
		let results = []
		for (let i = 0; i < _.size(obj); i++) {
			const record = obj[i]
			const result = _.get(record, 'result')

			const round = i + 1
			const threeTop = _.get(result, 'three_top') || null
			const twoTop = _.get(result, 'two_top') || null
			const twoUnder = _.get(result, 'two_under') || null

			const data = {
				round: round,
				three_top: threeTop,
				two_top: twoTop,
				two_under: twoUnder
			}

			results.push(data)
		}

		results = _.sortBy(results, ['round'])	

		return results
	}
}

module.exports = ResultYeekeeRepository