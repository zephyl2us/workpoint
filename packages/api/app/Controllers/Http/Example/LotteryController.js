'use strict'

const _ = use('lodash')
const Bull = use('Bull')
const Config = use('Config')
const LotteryStockResultJob = use('App/Jobs/LotteryStockResult')
const LotteryYeekeeResultJob = use('App/Jobs/LotteryYeekeeResult')
// const BullTestJob = use('App/Jobs/BullTest')


const moment = use('moment')
const rp = use('request-promise')

class LotteryController {

	async migrateExample () {
		const LotteryCategoryRepository = make('App/Repositories/LotteryCategoryRepository')
		const LotteryMigrateExampleJob = use('App/Jobs/Example/LotteryMigrateExample')
		const ExampleLottery = make('App/Models/Example/Lottery')

		let categories = await LotteryCategoryRepository.browse({
			filter: {
				types: ['government', 'stock']
			}
		}).fetch()

		categories = categories.toJSON()

		let ExampleCount = await ExampleLottery.query().count()
		ExampleCount = ExampleCount[0]['count(*)']

		const limit = 100
		const totalPage = Math.ceil(ExampleCount / 100)
		
		for(let i = 1; i <= totalPage; i++) {

			const data = {
				categories,
				limit,
				page: i,
				total_page: totalPage
			}

			// console.log(data)
			Bull.add(LotteryMigrateExampleJob.key, data)
		}
		
		return true
	}

	async pastResultThaiGlo () {
		const LotteryCategoryRepository = make('App/Repositories/LotteryCategoryRepository')
		const LotteryThaiGloResultJob = use('App/Jobs/Example/LotteryThaiGloResult')

		let initYear = 2013
		const nowYear = parseInt(moment().format('YYYY'))
		let dateAvilableToRequest = []

		while(initYear <= nowYear) {
			const url = `https://www.glo.or.th/api/lottery/getPeriodsByYear`
			const options = {
				method: 'POST',
				uri: url,
				body: {
					type: `CHECKED`,
					year: initYear
				},
				json: true
			}

			const res = await rp(options)
			.then(response => {
				return response
			}).catch(error => {
				return error
			})

			const status = _.get(res, 'statusCode') || null
			if(status === 200) {
				const data = _.map(_.get(res, 'response.result'), 'date')
				dateAvilableToRequest.push(_.uniq(data))
			}

			initYear = initYear + 1
		}
		dateAvilableToRequest =  _.flatten(dateAvilableToRequest)
		dateAvilableToRequest.sort((first, second) => new Date(first) - new Date(second))

		const category = await LotteryCategoryRepository.browse({
			filter: {
				slug: 'glo'
			}
		}).first()

		for (const date of dateAvilableToRequest) {
			Bull.add(LotteryThaiGloResultJob.key, { 
				category, 
				date 
			})
		}
	}

	async pastResultStock () {
	}
}

module.exports = LotteryController
