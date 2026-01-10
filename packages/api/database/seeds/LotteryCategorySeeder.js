'use strict'

const _ = use('lodash')

/*
|--------------------------------------------------------------------------
| LotteryCategorySeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const LotteryCategory = use('App/Models/LotteryCategory')

class LotteryCategorySeeder {
  async run () {
    const uniqueKey = 'slug'

    const lotteryCategories = [
      // Government
      {
        id: 1,
        slug: 'glo',
        zone: 'thai_glo',
        type: 'government',
        pre_start: 10,
        start_time: '01:00',
        available_day: [],
        end_delay: 0,
        end_time: '15:20',
        result_delay: null,
				result_time: null,
      },

      // Thai
      {
        id: 11,
        slug: 'gsb',
        zone: 'thai_gsb',
        type: 'government',
        pre_start: 5,
        start_time: '01:00',
        available_day: [],
        end_delay: 0,
        end_time: '12:30',
        result_delay: 0,
				result_time: '14:00',
      },
      {
        id: 12,
        slug: 'baac',
        zone: 'thai_baac',
        type: 'government',
        pre_start: 5,
        start_time: '01:00',
        available_day: [],
        end_delay: 0,
        end_time: '18:00',
        result_delay: 0,
				result_time: '18:30',
      },

      // Laos
      {
        id: 21,
        slug: 'laos',
        zone: 'laos',
        type: 'stock',
        pre_start: 1,
        start_time: '01:00',
        available_day: [1,3,5],
        end_delay: 0,
        end_time: '20:00',
        result_delay: 0,
				result_time: '20:30',
      },
      {
        id: 22,
        slug: 'laos_star',
        zone: 'laos',
        type: 'stock',
        pre_start: 1,
        start_time: '01:00',
        available_day: [1,2,3,4,5,6,7],
        end_delay: 0,
        end_time: '15:30',
        result_delay: 0,
				result_time: '16:00',
      },

      // Vietnam
      {
        id: 31,
        slug: 'vietnam',
        zone: 'vietnam',
        type: 'stock',
        pre_start: 0,
        start_time: '01:00',
        available_day: [1,2,3,4,5,6,7],
        end_delay: 0,
        end_time: '18:00',
        result_delay: 0,
				result_time: '18:30',
      },
      {
        id: 32,
        slug: 'vietnam_special',
        zone: 'vietnam',
        type: 'stock',
        pre_start: 0,
        start_time: '01:00',
        available_day: [1,2,3,4,5,6,7],
        end_delay: 0,
        end_time: '17:00',
        result_delay: 0,
				result_time: '17:30',
      },
      {
        id: 33,
        slug: 'vietnam_vip',
        zone: 'vietnam',
        type: 'stock',
        pre_start: 0,
        start_time: '01:00',
        available_day: [1,2,3,4,5,6,7],
        end_delay: 0,
        end_time: '19:00',
        result_delay: 0,
				result_time: '19:30',
      },

      // Malaysia
      {
        id: 41,
        slug: 'malaysia',
        zone: 'malaysia',
        type: 'stock',
        pre_start: 0,
        start_time: '01:00',
        available_day: [3,6,7],
        end_delay: 0,
        end_time: '18:00',
        result_delay: 0,
				result_time: '18:30',
      },

      // Stock
      {
        id: 1001,
        slug: 'thai_morning',
        zone: 'thai',
        type: 'stock',
        pre_start: 0,
        start_time: '01:00',
        available_day: [1,2,3,4,5],
        end_delay: 0,
        end_time: '09:50',
        result_delay: 0,
				result_time: '10:00',
      },
      {
        id: 1002,
        slug: 'thai_noon',
        zone: 'thai',
        type: 'stock',
        pre_start: 0,
        start_time: '01:00',
        available_day: [1,2,3,4,5],
        end_delay: 0,
        end_time: '12:20',
        result_delay: 0,
				result_time: '12:30',
      },
      {
        id: 1003,
        slug: 'thai_afternoon',
        zone: 'thai',
        type: 'stock',
        pre_start: 0,
        start_time: '01:00',
        available_day: [1,2,3,4,5],
        end_delay: 0,
        end_time: '14:20',
        result_delay: 0,
				result_time: '14:30',
      },
      {
        id: 1004,
        slug: 'thai_evening',
        zone: 'thai',
        type: 'stock',
        pre_start: 0,
        start_time: '01:00',
        available_day: [1,2,3,4,5],
        end_delay: 0,
        end_time: '16:30',
        result_delay: 0,
				result_time: '17:20',
      },
      {
        id: 1005,
        slug: 'japan_morning',
        zone: 'japan',
        type: 'stock',
        pre_start: 0,
        start_time: '01:00',
        available_day: [1,2,3,4,5],
        end_delay: 0,
        end_time: '09:20',
        result_delay: 0,
				result_time: '10:00',
      },
      {
        id: 1006,
        slug: 'japan_afternoon',
        zone: 'japan',
        type: 'stock',
        pre_start: 0,
        start_time: '01:00',
        available_day: [1,2,3,4,5],
        end_delay: 0,
        end_time: '12:50',
        result_delay: 0,
				result_time: '13:00',
      },
      {
        id: 1007,
        slug: 'hongkong_morning',
        zone: 'hongkong',
        type: 'stock',
        pre_start: 0,
        start_time: '01:00',
        available_day: [1,2,3,4,5],
        end_delay: 0,
        end_time: '10:50',
        result_delay: 0,
				result_time: '11:40',
      },
      {
        id: 1008,
        slug: 'hongkong_afternoon',
        zone: 'hongkong',
        type: 'stock',
        pre_start: 0,
        start_time: '01:00',
        available_day: [1,2,3,4,5],
        end_delay: 0,
        end_time: '14:50',
        result_delay: 0,
				result_time: '15:30',
      },
      {
        id: 1009,
        slug: 'china_morning',
        zone: 'china',
        type: 'stock',
        pre_start: 0,
        start_time: '01:00',
        available_day: [1,2,3,4,5],
        end_delay: 0,
        end_time: '10:00',
        result_delay: 0,
				result_time: '11:00',
      },
      {
        id: 1010,
        slug: 'china_afternoon',
        zone: 'china',
        type: 'stock',
        pre_start: 0,
        start_time: '01:00',
        available_day: [1,2,3,4,5],
        end_delay: 0,
        end_time: '13:40',
        result_delay: 0,
				result_time: '15:20',
      },
      {
        id: 1011,
        slug: 'korea',
        zone: 'korea',
        type: 'stock',
        pre_start: 0,
        start_time: '01:00',
        available_day: [1,2,3,4,5],
        end_delay: 0,
        end_time: '12:40',
        result_delay: 0,
				result_time: '13:50',
      },
      {
        id: 1012,
        slug: 'taiwan',
        zone: 'taiwan',
        type: 'stock',
        pre_start: 0,
        start_time: '01:00',
        available_day: [1,2,3,4,5],
        end_delay: 0,
        end_time: '12:00',
        result_delay: 0,
				result_time: '12:30',
      },
      {
        id: 1013,
        slug: 'singapore',
        zone: 'singapore',
        type: 'stock',
        pre_start: 0,
        start_time: '01:00',
        available_day: [1,2,3,4,5],
        end_delay: 0,
        end_time: '15:50',
        result_delay: 0,
				result_time: '16:30',
      },
      {
        id: 1014,
        slug: 'india',
        zone: 'india',
        type: 'stock',
        pre_start: 0,
        start_time: '01:00',
        available_day: [1,2,3,4,5],
        end_delay: 0,
        end_time: '16:50',
        result_delay: 0,
				result_time: '17:30',
      },
      {
        id: 1015,
        slug: 'egypt',
        zone: 'egypt',
        type: 'stock',
        pre_start: 0,
        start_time: '01:00',
        available_day: [1,2,3,4,7],
        end_delay: 0,
        end_time: '18:00',
        result_delay: 0,
				result_time: '20:00',
      },
      {
        id: 1016,
        slug: 'germany',
        zone: 'germany',
        type: 'stock',
        pre_start: 0,
        start_time: '01:00',
        available_day: [1,2,3,4,5],
        end_delay: 0,
        end_time: '22:20',
        result_delay: 0,
				result_time: '23:30',
      },
      {
        id: 1017,
        slug: 'england',
        zone: 'england',
        type: 'stock',
        pre_start: 0,
        start_time: '01:00',
        available_day: [1,2,3,4,5],
        end_delay: 0,
        end_time: '22:30',
        result_delay: 0,
				result_time: '23:30',
      },
      {
        id: 1018,
        slug: 'russia',
        zone: 'russia',
        type: 'stock',
        pre_start: 0,
        start_time: '01:00',
        available_day: [1,2,3,4,5],
        end_delay: 0,
        end_time: '22:10',
        result_delay: 0,
				result_time: '23:00',
      },
      {
        id: 1019,
        slug: 'america',
        zone: 'america',
        type: 'stock',
        pre_start: 0,
        start_time: '17:30',
        available_day: [1,2,3,4,5,6],
        end_delay: 1,
        end_time: '01:00',
        result_delay: 1,
				result_time: '04:00',
      },
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

module.exports = LotteryCategorySeeder
