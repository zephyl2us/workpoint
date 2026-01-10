'use strict'

const _ = use('lodash')
const moment = use('moment')
const md5 = use('md5')
const Config = use('Config')
const Redis = use('Redis')
const Helper = use('App/Helper')
const BrowserRepository = make('App/Repositories/BrowserRepository')

class ResultStockRepository {

  static get inject() {
    return []
  }

  constructor() {
		this.Redis = Redis.connection('lottery')
  }


  async stockRetro (key, date) {

    const newDateFormat = moment(date).add(543, 'years').format('MM-YYYY')
    const dateConvert = moment(date).format('YYYY-MM')
    const url = `https://www.raakaadee.com/ตรวจหวย-หุ้น/${key}/${newDateFormat}`
    const options = {
      wait_until: 'domcontentloaded'
    }

    const result = await BrowserRepository.puppeteer(url, options, async (page) => {

      await page.waitForSelector('div.postcontent2 table[width="98.5%"]', { timeout: 5000 });
      const stocks = await page.$$('div.postcontent2 table[width="98.5%"] tr[style="background-color: #BFBF6E;font-size:16px;"]')

      let results = []
      for (const i in stocks) {
        const list = stocks[i]
        let rowsCount = await list.$$('th')
        rowsCount = _.size(rowsCount)
        let rowDay = await list.$eval(`th:nth-child(1)`, number => number.textContent.match(/(?:\b(?:[1-9]|[12]\d|3[01])\b)/g))
        let twoUnder = await list.$eval(`th:nth-child(${rowsCount}) div`, number => number.textContent)
        let twoTop = await list.$eval(`th:nth-child(${rowsCount - 1}) div`, number => number.textContent)
        let threeTop = await list.$eval(`th:nth-child(${rowsCount - 2}) div`, number => number.textContent)

        twoUnder = twoUnder === '-' ? null : twoUnder
        twoTop = twoTop === '-' ? null : twoTop
        threeTop = threeTop === '-' ? null : threeTop

        if (_.isNull(twoUnder) && _.isNull(twoTop) && _.isNull(threeTop)) continue
        
        rowDay = _.padStart(_.first(rowDay), 2, '0')
        let tempDate = `${dateConvert}-${rowDay}`
        const stockData = {
          date: tempDate,
          three_top: threeTop,
          two_top: twoTop,
          two_under: twoUnder
        }
        results.push(stockData)
      }

      return {
        stocks: results
      }
    })

    return _.get(result, 'data') || null
  }

  async lottovip (date) {

    let cookie = await this.Redis.get(`cookie:lottovip`)
    if (!cookie) {
      return false
    }

    const slugs = Config.get(`lottery.stockSlug.lottovip`)
    if (!slugs) return 

    cookie = JSON.parse(cookie)

    const unixDate = moment(date).valueOf()
    const url = `https://www.lottovip.com/member/result/all/${unixDate}`
    const options = {
      cookie: cookie
    }

    const result = await BrowserRepository.puppeteer(url, options, async (page) => {

      await page.waitForSelector('#foreignStock div.pc-view div.card.border-dark.text-center.mb-2', { timeout: 5000 });
      const stocks = await page.$$('#foreignStock div.pc-view div.card.border-dark.text-center.mb-2')
      const thStock = await page.$$('#thaiStock div.d-flex.flex-row')
      // const bankStock = await page.$$('section#contentbox > div:first-child')

      let results = {}

      for (const i in stocks) {
        const stock = stocks[i]
        let key = await stock.$eval('div:first-child', number => number.textContent)
        key = _.replace(key,/[\s]/g, '')
        const threeTop = await stock.$eval('div:last-child > div > div.card:first-child > div:last-child > p', number => number.textContent)
        const twoUnder = await stock.$eval('div:last-child > div > div.card:last-child > div:last-child > p', number => number.textContent)

        if (_.first(threeTop) === 'x') continue;
        if (!slugs[key]) continue;

        const result = {
          three_top: threeTop,
          two_top: threeTop ? threeTop.slice(-2) : null,
          two_under: twoUnder
        }
        results[slugs[key]] = result
      }

      const thStockData = _.get(thStock, '0')
      if (thStockData) {
        const thStockThreeTop = await thStockData.$eval('div.card:nth-child(1) p', number => number.textContent)
        const thStockTwoUnder = await thStockData.$eval('div.card:nth-child(2) p', number => number.textContent)
        const thStockTwoTop = thStockThreeTop ? thStockThreeTop.slice(-2) : null
  
        if (thStockThreeTop !== 'xxx') {
          results['thai_evening'] = {
            three_top: thStockThreeTop,
            two_top: thStockTwoTop,
            two_under: thStockTwoUnder
          }
        }
      }

      return results
    })

    return _.get(result, 'data') || null
  }

  async lotto432 (date) {
    const url = `https://api66lotto.com/lotto/api/huay/prize?date=${date}`

    const dateOnlyAmerica = moment(date).add(1, 'days').format('YYYY-MM-DD')
    const urlOnlyAmerica = `https://api66lotto.com/lotto/api/huay/prize?date=${dateOnlyAmerica}`

    const options = {
      method: 'GET',
      uri: url,
      json: true,
    }


    const americaOptions = {
      method: 'GET',
      uri: urlOnlyAmerica,
      json: true,
    }

    const americaReseult = await BrowserRepository.request(americaOptions)
		const result = await BrowserRepository.request(options)

    const records = _.get(result, 'stock')
    const thStock = _.get(result, 'thaiStock.3')
    const thStockThreeTop = _.get(thStock, 'topThree')
    const thStockTwoTop = thStockThreeTop ? thStockThreeTop.slice(-2) : null
    const thStockTwoUnder = _.get(thStock, 'bottomTwo')

    const americaRecords = _.get(americaReseult, 'stock')
    let americaStock = _.filter(americaRecords, { name: "ดาวน์โจน" })
    americaStock = _.first(americaStock)

    // console.log(americaStock)

    let results = {}

    _.each(records, (record) => {
      const threeTop = _.get(record, 'topThree')
      const twoTop = threeTop ? threeTop.slice(-2) : null
      const twoUnder = _.get(record, 'bottomTwo')
      let categoryName = _.get(record, 'name')
      categoryName = _.replace(categoryName, ' ', '_')

      if (threeTop === 'xxx') return

      const result = {
        three_top: threeTop,
        two_top: twoTop,
        two_under: twoUnder
      }

      const slug = Config.get(`lottery.stockSlug.lotto432.${categoryName}`)

      if(!slug) return
      if(slug === 'america') return
      
      results[slug] = result
    })

    if (americaStock.topThree !== 'xxx') results['america'] = {
      three_top: americaStock.topThree,
      two_top: americaStock.topThree.slice(-2),
      two_under: americaStock.bottomTwo
    }

    if (thStockThreeTop !== 'xxx') results['thai_evening'] = {
      three_top: thStockThreeTop,
      two_top: thStockTwoTop,
      two_under: thStockTwoUnder
    }

    return results
  }

  async kklotto (date) {
    const categories = Config.get(`lottery.stockSlug.kklotto`)
    if (!categories) return

    const adjustDateFormat = moment(date).format('YYYYMMDD')
    const adjustDateAmericaFormat = moment(date).add(1, 'days').format('YYYYMMDD')
    const url = `https://api.kklotto.com/info/getResult/${adjustDateFormat}`
    const urlOnlyAmerica = `https://api.kklotto.com/info/getResult/${adjustDateAmericaFormat}`

    const options = {
      method: 'GET',
      uri: url,
      json: true
    }

    const americaOptions = {
      method: 'GET',
      uri: urlOnlyAmerica,
      json: true
    }

		const result = await BrowserRepository.request(options)
		const americaResult = await BrowserRepository.request(americaOptions)
    const data = _.get(result, 'info')
    const dataAmerica = _.get(americaResult, 'info')

    let results = {}

    _.each(categories, (slug, key) => {
      let record = _.filter(data, { productCode: key })

      if(slug === 'america') record = _.filter(dataAmerica, { productCode: key })
      if (!record) return

      const threeTop = _.get(record, '0.award1')
      const twoTop = threeTop ? threeTop.slice(-2) : null
      const twoUnder = _.get(record, '0.award2')

      if (threeTop === 'xxx') return

      const result = {
        three_top: threeTop,
        two_top: twoTop,
        two_under: twoUnder
      }

      results[slug] = result
    })

    return results
  }

}

module.exports = ResultStockRepository
