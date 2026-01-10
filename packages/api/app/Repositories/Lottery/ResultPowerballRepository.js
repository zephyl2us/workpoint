'use strict'

const _ = use('lodash')
const moment = use('moment')
const Config = use('Config')
const Redis = use('Redis')
const Helper = use('App/Helper')
const BrowserRepository = make('App/Repositories/BrowserRepository')

class ResultPowerballRepository {

  static get inject() {
    return [
    ]
  }

  constructor() {

  }

  async powerball() {
		const pbConfig = Config.get('powerball')
		const url = `https://www.thelotter.com/lottery-results/`

		try {
			const options = {
				method: 'GET',
				url: url,
				json: true
			}

			const resultRequest = await BrowserRepository.request(options)
			const dataRegEx = /data \: (?<lotto>[\W\w]*])$/gm
			const dataText = dataRegEx.exec(resultRequest)
			let txt = _.get(dataText, 'groups.lotto')

			if (!txt) return null
			txt = _.replace(txt, /\"/gm, '\\\"')
			txt = _.replace(txt, /\'/gm, '\"')

			const data = JSON.parse(txt)
			let powerball = {}
			for (const item of data) {
				const ballRegEx = /<span class="results-ball-regular results-ball iconMini"><span class="results-number iconMini">(?<balls>\d+)<\/span>/gm
				const luckyRegEx = /<span class="results-ball-bonus results-ball iconMini"><span class="results-number iconMini">(?<balls>\d+)<\/span>/gm
				const powerRegEx = /<span class="results-ball-additional results-ball iconMini"><span class="results-number iconMini">(?<balls>\d+)<\/span>/gm
				const result = item.WinningNumbersRegularResults
				const results = {}
				const balls = this.extractNumber(ballRegEx, result)
				const luckies = this.extractNumber(luckyRegEx, result)
				const powers = this.extractNumber(powerRegEx, result)

				if (!_.isEmpty(balls)) _.assign(results, { balls: balls })
				if (!_.isEmpty(luckies)) _.assign(results, { luckies: luckies })
				if (!_.isEmpty(powers)) _.assign(results, { powers: powers })

				const lotto = {
					lotto_name: item.LotteryFullName,
					lotter_slug: _.replace(_.replace(item.NiceUrlLink, 'https://www.thelotter.com/lottery-results/', ''), '/', ''),
					unix_date: item.DrawDateInUnixSeconds,
					draw_date: moment.unix(item.DrawDateInUnixSeconds).format('YYYY-MM-DD HH:mm:ss'),
					draw_number: item.DrawNumber,
					draw_ref: item.DrawRef,
					results: results
				}

				const config = _.filter(pbConfig, { result_path: lotto.lotter_slug })
				if(!_.isEmpty(config) && !_.isEmpty(results)) {
					powerball[config[0].slug] = lotto
				}
			}
			return powerball
		} catch (e) {
			const dataLogs = {
				title: 'powerball',
				path: 'app/Repositories/Lottery/ResultPowerballRepository',
				channel: 'kue',
				message: e.message,
				data: e,
        url: url
				// params: data
			}
			LogRepository.fire(dataLogs)
		}
	}

  extractNumber(regex, data) {
		let matches = data.matchAll(regex)
    let balls = []
    for (const item of matches) {
      balls.push(parseInt(_.get(item, 'groups.balls')))
    }
    return balls
  }
}

module.exports = ResultPowerballRepository
