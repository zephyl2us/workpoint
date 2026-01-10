'use strict'

const { result } = require('lodash')
const md5 = require('md5')

const _ = use('lodash')
const Bull = use('Bull')
const langdetect = use('langdetect')
// const BullTestJob = use('App/Jobs/BullTest')

class SoccerController {

	constructor() {
		this.oddsUrl = 'https://www.thscore.vip/oddscomp/'

		this.bookmakers = [
      'sbobet',
      'ibcbet',
      '188bet',
      'm88',
      '18bet',
      'vcbet',
      'bet365'
    ]
	}

	async test ({ request, response }) {
		const { id } = request.all()

		const odds = await this.oddsUpdate(id)

		return odds
	}


	async oddsUpdate(api, apiInverse = false) {

		const puppeteer = require('puppeteer')

		const launchArg = {
			headless: 'new',
			args: ['--no-sandbox']
		}
		
    const url = this.oddsUrl + api;
    let odds = {}

		// console.log(url)

		const browser = await puppeteer.launch(launchArg);
		const page = await browser.newPage();
		await page.setViewport({ width: 1280, height: 800 })
		await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36')
		await page.goto(url, { waitUntil: 'networkidle0'})
		// console.log(element)

		const oddsRows = await page.$$('#CompanyOddsDiv tr[name=oddsTr]')

		for (const row of oddsRows) {
			let bookmaker = await row.$eval('td[width="10%"', bookmaker => bookmaker.innerText)
			bookmaker = _.toLower(bookmaker)
			// console.log(bookmaker)
			
      if(_.includes(this.bookmakers, bookmaker)) {
				const oddsCols = await row.$$('td[width="7%"')
				let prices = []
				for(const col of oddsCols) {
					// const lists = await row.$$('span')
	
					const first = await col.$eval('span:first-child', el => el.getAttribute("data-o"))
					const live = await col.$eval('span:nth-child(2)', el => el.getAttribute("data-o"))
	
					const price = { first, live }
					prices.push(price)
	
					// console.log(price)
				}
	
				let hdcType = prices[1]
				hdcType.first = this.getBetType(hdcType.first)
				hdcType.live = this.getBetType(hdcType.live)
				let hdcHome = prices[0]
				let hdcAway = prices[2]
	
				let ouType = prices[7]
				ouType.first = this.getBetType(ouType.first)
				ouType.live = this.getBetType(ouType.live)
				const ouHigh = prices[6]
				const ouLow = prices[8]
	
        if (apiInverse) {
          const hdcTmp = hdcHome;
          hdcHome = hdcAway
          hdcAway = hdcTmp
          if(hdcType.first[1] == 1) {
              hdcType.first[1] = 2;
          } else {
              hdcType.first[1] = 1;
          }
          if(hdcType.live[1] == 1) {
              hdcType.live[1] = 2;
          } else {
              hdcType.live[1] = 1;
          }
        }

				let oddsPrice = {
					first: {
						wager: hdcType.first[1],
						hdc_type: hdcType.first[0],
						hdc_home: Math.trunc(hdcHome.first * 100),
						hdc_away: Math.trunc(hdcAway.first * 100),
						ou_type: ouType.first[0],
						ou_high: Math.trunc(ouHigh.first * 100),
						ou_low: Math.trunc(ouLow.first * 100)
					},
					live: {
						wager: hdcType.live[1],
						hdc_type: hdcType.live[0],
						hdc_home: Math.trunc(hdcHome.live * 100),
						hdc_away: Math.trunc(hdcAway.live * 100),
						ou_type: ouType.live[0],
						ou_high: Math.trunc(ouHigh.live * 100),
						ou_low: Math.trunc(ouLow.live * 100)
					}
	
				}
	
				// console.log(oddsPrice)

				odds[bookmaker] = oddsPrice
			}
		}

		// console.log(odds)

		// const oddsDiv = await page.$$('#CompanyOddsDiv')

  	await browser.close()

		return odds
	}

	async _oddsUpdate(api, api_inverse = false) {

    let bodyPage = ''
    bodyPage = await JSDOM.fromURL(url).then(dom => {
      const response = dom.serialize()
      return response
    })

    bodyPage = bodyPage.toLowerCase()
    bodyPage = bodyPage.replace('\n', '')
    bodyPage = bodyPage.replace('\r', '')
    bodyPage = bodyPage.replace('\t', '')
    bodyPage = bodyPage.replace(/\s{2,}/g, '')
    const matchTable = bodyPage.match(/<table cellspacing(.*?)<\/table>/g)
    if(!matchTable) return
    // return matchTable
    const table = matchTable[0]
    const tablePattern = /<tr name=\"oddstr\"(?<tableRow>.*?)><th width=\"12%\" height=\"30\">(?<data>.*?)<\/th><\/tr>/g
    let result
    while(result = tablePattern.exec(table)) {
      let data = result.groups.data
      data = data.replace(' <font color="red">live</font>', '')
      data = data.replace(' <font color="red">ล่วงหน้า</font>', '')
      let matchName = data.match(/^(?<name>\w+)<\/th>/)
      let nameBookmaker = matchName.groups.name
      if(_.includes(this.bookmakers, nameBookmaker)) {
        let price = []
        const pricePattern = /<td(.*?)width=\"(.*?)%\" data-o=\"(?<old>.*?)\" data-l=\"(?<live>.*?)\">(?<price>.*?)<\/td>/g
        let priceResult
        while(priceResult = pricePattern.exec(data)) {
          let rawPrice = priceResult.groups.price
          price.push(rawPrice)
        }
        if (_.isEmpty(price)) continue
        if (_.size(price) != 6) continue

        let hdc_home = this.explodeBet(price[0])
        let hdc_type = this.explodeBet(price[1])
        let hdc_away = this.explodeBet(price[2])
        let ou_high = this.explodeBet(price[3])
        let ou_type = this.explodeBet(price[4])
        let ou_low = this.explodeBet(price[5])

        hdc_type.first = this.getBetType(hdc_type.first)
        hdc_type.live = this.getBetType(hdc_type.live)
        ou_type.first = this.getBetType(ou_type.first)
        ou_type.live = this.getBetType(ou_type.live)

        if (api_inverse) {
          let hdc_tmp = hdc_home;
          hdc_home = hdc_away;
          hdc_away = hdc_tmp;
          if(hdc_type.first[1] == 1) {
              hdc_type.first[1] = 2;
          } else {
              hdc_type.first[1] = 1;
          }
          if(hdc_type.live[1] == 1) {
              hdc_type.live[1] = 2;
          } else {
              hdc_type.live[1] = 1;
          }
        }
        let oddsPrice = {
          first: {
            wager: hdc_type.first[1],
            hdc_type: hdc_type.first[0],
            hdc_home: Math.trunc(hdc_home.first * 100),
            hdc_away: Math.trunc(hdc_away.first * 100),
            ou_type: ou_type.first[0],
            ou_high: Math.trunc(ou_high.first * 100),
            ou_low: Math.trunc(ou_low.first * 100)
          },
          live: {
            wager: hdc_type.live[1],
            hdc_type: hdc_type.live[0],
            hdc_home: Math.trunc(hdc_home.live * 100),
            hdc_away: Math.trunc(hdc_away.live * 100),
            ou_type: ou_type.live[0],
            ou_high: Math.trunc(ou_high.live * 100),
            ou_low: Math.trunc(ou_low.live * 100)
          }
        }
        odds[nameBookmaker] = oddsPrice
      }
    }
    // console.log(odds)
		return odds
    // await this.MatchRepository.oddsUpdate(api, odds)
  }


  getBetType(key) {
    let result
    let wager = 1

    key = _.split(key, '/')
    if (_.size(key) == 1) {
      if(key[0] < 0) {
        key[0] *= -1
        wager = 2
      }
      result = key[0]
    } else {
      if(key[0] < 0 || key[1] < 0) {
        if(key[0] < 0) {
            key[0] *= -1;
        }
        if(key[1] < 0) {
            key[1] *= -1;
        }
        wager = 2;
      }
      result = key[1] - 0.25;
    }
    return [
      ((result * 4) + 1),
      wager
    ]
  }

	explodeBet(price) {
    // console.log(price)
    const pattern = /<span>(?<first>.*?)<\/span><span class(.*?)>(?<live>.*?)<\/span>/g
    const { groups:{ first, live }} = pattern.exec(price)
    if (_.isUndefined(first) && _.isNull(first) && _.isUndefined(live) && _.isNull(live)) {
      return {
        first: '',
        live: ''
      }
    }
    return {
      first: first,
      live: live
    }
  }
}

module.exports = SoccerController
