'use strict'

const _ = use('lodash')
const moment = use('moment')
const Config = use('Config')
const Redis = use('Redis')
const rp = use('request-promise')
const Helper = use('App/Helper')

class LotteryResultRequestRepository {

  static get inject() {
    return []
  }

  constructor() {
		this.Redis = Redis.connection('lottery')
  }

	async request (options) {
    const privateProxy = Helper.privateProxy()
    if(privateProxy) {
      options.proxy = privateProxy
    }
		
    // console.log(options)

    const result = await rp(options)
    .then(function (response) {
      return response
    })
    .catch(function (error) {
      return error
    })
    
    // console.log(result)

    return result
	}

  async requestLottoone (date) {
		let token = await this.Redis.get(`cookie:lottoone`)

    if(!token) {
      return false
    }

		token = JSON.parse(token)
		let utoken = _.get(_.find(token, ['name', 'utoken']), 'value')

		if(_.isUndefined(utoken)) return false
		
		utoken = JSON.parse(decodeURIComponent(utoken))
		const bearerToken = _.get(utoken, 'token')

    const url = `https://lottoone.net/api/lotto/result/${date}`

    // console.log(url)

    const options = {
      method: 'GET',
      uri: url,
			headers: {
				authorization: `Bearer ${bearerToken}`
			},
      json: true
    }
    // console.log(options)

		const result = await this.request(options)
    return result
  }
  async requestLtobet (date) {
    const url = `https://www.ltobet.com/api/member/lotto/result/${date}`

    // console.log(url)

    const options = {
      method: 'GET',
      uri: url,
      json: true
    }

		const result = await this.request(options)
    return result
  }
  async requestHuay (date) {
    const url = `https://www.huay.com/api/v1/public/lottery/list-round-result?round_date=${date}`

    // console.log(url)

    const options = {
      method: 'GET',
      uri: url,
      json: true
    }

		const result = await this.request(options)
    return result
  }
  async requestDnabet (date) {
    const url = `https://www.dnabet.com/api/v1/public/lottery/list-round-result?round_date=${date}`

    // console.log(url)

    const options = {
      method: 'GET',
      uri: url,
      json: true
    }

		const result = await this.request(options)
    return result
  }

  async getStockResultLottoone (date) {
    const result = await this.requestLottoone(date)
    const data = _.get(result, 'records')

    // console.log(`Stock`, result)

		let records = []
		let results = {}

		_.each(data, (data, key) => {
			const categoryId = _.get(data, 'category_id')
			if(categoryId >= 11 && categoryId <= 100) {
				records.push(data)

				const result = {
					three_top: _.get(data, 'result.three_top'),
					two_top: _.get(data, 'result.two_top'),
					two_under: _.get(data, 'result.two_under')
				}

				const slug = Config.get(`lottery.stockSlug.lottoone.${categoryId}`)

				if(!slug) return
				
				results[slug] = result
			}
		})

    return results
  }

  async getStockResultLtobet (date) {
    const result = await this.requestLtobet(date)
    const data = _.get(result, 'records')

		let records = []
		let results = {}

		_.each(data, (data, key) => {
			const categoryId = _.get(data, 'category_id')
			if(categoryId >= 11 && categoryId <= 100) {
				records.push(data)

				const result = {
					three_top: _.get(data, 'result.three_top'),
					two_top: _.get(data, 'result.two_top'),
					two_under: _.get(data, 'result.two_under')
				}

				const slug = Config.get(`lottery.stockSlug.ltobet.${categoryId}`)

				if(!slug) return
				
				results[slug] = result
			}
		})

    return results
  }

  async getStockResultDnabet (date) {
    const result = await this.requestDnabet(date)
		const data = _.get(result, 'data')

		let records = []
		let results = {}

		_.each(data, (lottoGroup, key) => {
			const record = _.get(lottoGroup, '0')
			const lottoType = _.get(record, 'lotto_type')
			const lottoSubType = _.get(record, 'lotto_subtype')
			// console.log(lottoGroup)

			if(_.includes(["02", "03"], lottoType)) {
				records.push(record)

				if(!_.has(record, 'result.top_three')) return

				const categoryId = parseInt(`${lottoType}${lottoSubType}`)

				const threeTop = _.get(record, 'result.top_three')
				const twoTop = threeTop ? threeTop.slice(-2) : null
				const result = {
					three_top: threeTop,
					two_top: twoTop,
					two_under: _.get(record, 'result.bottom_two')
				}

				// console.log(record)
				// console.log(_.get(record, 'result'))

				const slug = Config.get(`lottery.stockSlug.dnabet.${categoryId}`)

				if(!slug) return
				
				results[slug] = result

			}
		})

		// console.log(result)
    return results
  }
  
  async getYeekeeResultLottoone (date) {
    const getResult = (startId, endId, arr) => {
      const records = _.filter(arr, function(record) {
        return record.category_id >= startId && record.category_id <= endId
      })

      let results = []
      for (const record of records) {
        const result = _.get(record, 'result')
        // console.log(result)
        const round = parseInt(_.get(record, 'category_id') - startId + 1)
        const threeTop = _.get(result, 'three_top') || null
        const twoTop = threeTop ? threeTop.slice(-2) : null
        const twoUnder = _.get(result, 'two_under') || null

        const data = {
          round: round,
          three_top: threeTop,
          two_top: twoTop,
          two_under: twoUnder
        }

        results.push(data)
      }

      return results
    }

    const result = await this.requestLottoone(date)
    const data = _.get(result, 'records')

    const yeekeeRecords = getResult(101, 188, data)
    const yeekeeVipRecords = getResult(201, 288, data)

    const yeekee5MinRecords = getResult(301, 564, data)
    const yeekee5MinVipRecords = getResult(601, 864, data)

    return {
      lottoone_yeekee: yeekeeRecords,
      lottoone_yeekee_vip: yeekeeVipRecords,
      lottoone_5min: yeekee5MinRecords,
      lottoone_5min_vip: yeekee5MinVipRecords,
    }
  }

  async getYeekeeResultLtobet (date) {
    const getResult = (startId, endId, arr) => {
      const records = _.filter(arr, function(record) {
        return record.category_id >= startId && record.category_id <= endId
      })

      let results = []
      for (const record of records) {
        const result = _.get(record, 'result')
        // console.log(result)
        const round = parseInt(_.get(record, 'category_id') - startId + 1)
        const threeTop = _.get(result, 'three_top') || null
        const twoTop = threeTop ? threeTop.slice(-2) : null
        const twoUnder = _.get(result, 'two_under') || null

        const data = {
          round: round,
          three_top: threeTop,
          two_top: twoTop,
          two_under: twoUnder
        }

        results.push(data)
      }

      return results
    }

    const result = await this.requestLtobet(date)
    const data = _.get(result, 'records')

    const yeekeeRecords = getResult(101, 188, data)
    const yeekeeVipRecords = getResult(201, 288, data)

    const yeekee5MinRecords = getResult(701, 964, data)
    const yeekee5MinVipRecords = getResult(1501, 1764, data)

    return {
      ltobet_yeekee: yeekeeRecords,
      ltobet_yeekee_vip: yeekeeVipRecords,
      ltobet_5min: yeekee5MinRecords,
      ltobet_5min_vip: yeekee5MinVipRecords,
    }
  }
  
  async getYeekeeResultHuay (date) {
    const getResult = (key, obj) => {
      // console.log(obj[key])
      const records = _.get(obj, key)
      // console.log(records)

      let results = []
      _.each(records, (record) => {
        const result = _.get(record, 'result')
        // console.log(result)
        const round = parseInt(_.get(record, 'round_number'))
        const threeTop = _.get(result, 'top_three') || null
        const twoTop = threeTop ? threeTop.slice(-2) : null
        const twoUnder = _.get(result, 'bottom_two') || null

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

    const result = await this.requestHuay(date)
    const data = _.get(result, 'data')

    const yeekeeRecords = getResult("0125", data)
    const yeekeeVipRecords = getResult("0127", data)

    const yeekee5MinRecords = getResult("0126", data)
    const yeekee5MinVipRecords = getResult("0128", data)

    return {
      huay_yeekee: yeekeeRecords,
      huay_yeekee_vip: yeekeeVipRecords,
      huay_5min: yeekee5MinRecords,
      huay_5min_vip: yeekee5MinVipRecords,
    }
  }
  
  async getYeekeeResultDnabet (date) {
    const getResult = (key, obj) => {
      // console.log(obj[key])
      const records = _.get(obj, key)
      // console.log(records)

      let results = []
      _.each(records, (record) => {
        const result = _.get(record, 'result')
        // console.log(result)
        const round = parseInt(_.get(record, 'round_number'))
        const threeTop = _.get(result, 'top_three') || null
        const twoTop = threeTop ? threeTop.slice(-2) : null
        const twoUnder = _.get(result, 'bottom_two') || null

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

    const result = await this.requestDnabet(date)
    const data = _.get(result, 'data')

    const yeekeeRecords = getResult("0101", data)
    const yeekeeVipRecords = getResult("0103", data)

    const yeekee5MinRecords = getResult("0102", data)
    const yeekee5MinVipRecords = getResult("0104", data)

    return {
      dnabet_yeekee: yeekeeRecords,
      dnabet_yeekee_vip: yeekeeVipRecords,
      dnabet_5min: yeekee5MinRecords,
      dnabet_5min_vip: yeekee5MinVipRecords,
    }
  }


}

module.exports = LotteryResultRequestRepository
