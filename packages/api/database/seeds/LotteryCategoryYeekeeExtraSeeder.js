'use strict'

const _ = use('lodash')

/*
|--------------------------------------------------------------------------
| LotteryCategoryYeekeeSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const LotteryCategory = use('App/Models/LotteryCategory')

class LotteryCategoryYeekeeSeeder {
  async run () {
    const uniqueKey = 'slug'

    const yeekeeTemplate = {
      type: 'yeekee',
      total_round: 88,
      pre_start: 0,
      start_time: '05:00',
      available_day: [1,2,3,4,5,6,7],
      end_delay: 1,
      end_time: '04:00',
      result_delay: null,
      result_time: null,
    }

    const lotteryCategories = [

      // Yeekee 9898Huay

      _.assign({}, yeekeeTemplate, {
        id: 11001,
        slug: 'huay9898_yeekee',
        zone: 'huay9898',
        total_round: 94,
      }),

      // Yeekee MovewinBet

      _.assign({}, yeekeeTemplate, {
        id: 11011,
        slug: 'movewin_yeekee',
        zone: 'movewin',
      }),
      _.assign({}, yeekeeTemplate, {
        id: 11012,
        slug: 'movewin_yeekee_vip',
        zone: 'movewin',
        total_round: 288,
      }),
      
       // Yeekee Settee

      _.assign({}, yeekeeTemplate, {
        id: 11021,
        slug: 'settee_yeekee_vip',
        zone: 'settee',
        total_round: 141,
      }),
      
      // Yeekee Jaywaii

      _.assign({}, yeekeeTemplate, {
        id: 11031,
        slug: 'jaywaii_yeekee_vip',
        zone: 'jaywaii',
        total_round: 141,
      }),

       // Yeekee Huay2525

       _.assign({}, yeekeeTemplate, {
        id: 11041,
        slug: 'huay2525_yeekee_vip',
        zone: 'huay2525',
        total_round: 141,
      }),

      // Yeekee Rachahuay

      _.assign({}, yeekeeTemplate, {
        id: 11051,
        slug: 'rachahuay_yeekee_vip',
        zone: 'rachahuay',
        total_round: 141,
      }),

       // Yeekee Masurebet

       _.assign({}, yeekeeTemplate, {
        id: 11061,
        slug: 'masurebet_yeekee_vip',
        zone: 'masurebet',
        total_round: 141,
      }),
      
      // Yeekee Cat999

      _.assign({}, yeekeeTemplate, {
        id: 11071,
        slug: 'cat999_5min_vip',
        zone: 'cat999',
        total_round: 288,
      }),

      // Yeekee Cat999

      _.assign({}, yeekeeTemplate, {
        id: 11081,
        slug: 'cat888_5min_vip',
        zone: 'cat888',
        total_round: 288,
      }),

      // Yeekee LuxNumber

      _.assign({}, yeekeeTemplate, {
        id: 11091,
        slug: 'luxnumber_yeekee',
        zone: 'luxnumber',
        total_round: 95,
        start_time: '06:00',
        end_time: '06:00',
      }),

      // Yeekee Lottorich28

      _.assign({}, yeekeeTemplate, {
        id: 11101,
        slug: 'lottorich28_yeekee',
        zone: 'lottorich28',
        total_round: 144,
      }),
      
      // Yeekee Kerry899

      _.assign({}, yeekeeTemplate, {
        id: 11111,
        slug: 'kerry899_yeekee_vip',
        zone: 'kerry899',
        total_round: 144,
      }),

      // Yeekee Uwin789

      _.assign({}, yeekeeTemplate, {
        id: 11121,
        slug: 'uwin789_yeekee',
        zone: 'uwin789',
        total_round: 96,
      }),
    ]

    for(let i in lotteryCategories) {
      const lotteryCategory = lotteryCategories[i]
      const slug = _.get(lotteryCategory, 'slug')

      const data = await LotteryCategory.findBy('slug', slug)

      if(!_.isNull(data)) {
        continue
      }

      const lottery = await LotteryCategory.create(lotteryCategory)
      console.log('lottery: ', lottery)
    }

    // await LotteryCategory.createMany(lotteryCategories)
  }
}

module.exports = LotteryCategoryYeekeeSeeder
