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

      // Yeekee Huay

      _.assign({}, yeekeeTemplate, {
        id: 10001,
        slug: 'huay_yeekee',
        zone: 'huay',
      }),
      _.assign({}, yeekeeTemplate, {
        id: 10002,
        slug: 'huay_yeekee_vip',
        zone: 'huay',
      }),
      _.assign({}, yeekeeTemplate, {
        id: 10003,
        slug: 'huay_5min',
        zone: 'huay',
        total_round: 264,
      }),
      _.assign({}, yeekeeTemplate, {
        id: 10004,
        slug: 'huay_5min_vip',
        zone: 'huay',
        total_round: 264,
      }),

      // Yeekee Lottoone

      _.assign({}, yeekeeTemplate, {
        id: 10011,
        slug: 'lottoone_yeekee',
        zone: 'lottoone',
      }),
      _.assign({}, yeekeeTemplate, {
        id: 10012,
        slug: 'lottoone_yeekee_vip',
        zone: 'lottoone',
      }),
      _.assign({}, yeekeeTemplate, {
        id: 10013,
        slug: 'lottoone_5min',
        zone: 'lottoone',
        total_round: 264,
      }),
      _.assign({}, yeekeeTemplate, {
        id: 10014,
        slug: 'lottoone_5min_vip',
        zone: 'lottoone',
        total_round: 264,
      }),

      // Yeekee Ltobet

      _.assign({}, yeekeeTemplate, {
        id: 10021,
        slug: 'ltobet_yeekee',
        zone: 'ltobet',
      }),
      _.assign({}, yeekeeTemplate, {
        id: 10022,
        slug: 'ltobet_yeekee_vip',
        zone: 'ltobet',
      }),
      _.assign({}, yeekeeTemplate, {
        id: 10023,
        slug: 'ltobet_5min',
        zone: 'ltobet',
        total_round: 264,
      }),
      _.assign({}, yeekeeTemplate, {
        id: 10024,
        slug: 'ltobet_5min_vip',
        zone: 'ltobet',
        total_round: 264,
      }),

      // Yeekee Dnabet

      _.assign({}, yeekeeTemplate, {
        id: 10031,
        slug: 'dnabet_yeekee',
        zone: 'dnabet',
      }),
      _.assign({}, yeekeeTemplate, {
        id: 10032,
        slug: 'dnabet_yeekee_vip',
        zone: 'dnabet',
      }),
      _.assign({}, yeekeeTemplate, {
        id: 10033,
        slug: 'dnabet_5min',
        zone: 'dnabet',
        total_round: 264,
      }),
      _.assign({}, yeekeeTemplate, {
        id: 10034,
        slug: 'dnabet_5min_vip',
        zone: 'dnabet',
        total_round: 264,
      }),

      // Yeekee Thailotto

      _.assign({}, yeekeeTemplate, {
        id: 10041,
        slug: 'thailotto_yeekee',
        zone: 'thailotto',
      }),
      _.assign({}, yeekeeTemplate, {
        id: 10042,
        slug: 'thailotto_5min',
        zone: 'thailotto',
        total_round: 264,
      }),

      // Yeekee HuayOnline95

      _.assign({}, yeekeeTemplate, {
        id: 10051,
        slug: 'huay95_yeekee',
        zone: 'huay95',
      }),
      _.assign({}, yeekeeTemplate, {
        id: 10052,
        slug: 'huay95_5min',
        zone: 'huay95',
        total_round: 264,
      }),

      // Yeekee KKLotto

      _.assign({}, yeekeeTemplate, {
        id: 10061,
        slug: 'kklotto_yeekee',
        zone: 'kklotto',
      }),
      _.assign({}, yeekeeTemplate, {
        id: 10062,
        slug: 'kklotto_5min',
        zone: 'kklotto',
        total_round: 264,
      }),

      // Yeekee YesLotto

      _.assign({}, yeekeeTemplate, {
        id: 10071,
        slug: 'yeslotto_yeekee',
        zone: 'yeslotto',
      }),
      _.assign({}, yeekeeTemplate, {
        id: 10072,
        slug: 'yeslotto_5min',
        zone: 'yeslotto',
        total_round: 264,
      }),

      // Yeekee Teng1

      _.assign({}, yeekeeTemplate, {
        id: 10081,
        slug: 'teng1_yeekee',
        zone: 'teng1'
      }),
      _.assign({}, yeekeeTemplate, {
        id: 10082,
        slug: 'teng1_yeekee_vip',
        zone: 'teng1',
      }),

      // Yeekee Lotto432

      _.assign({}, yeekeeTemplate, {
        id: 10091,
        slug: 'lotto432_yeekee',
        zone: 'lotto432',
      }),


      // Yeekee Ruamchoke

      _.assign({}, yeekeeTemplate, {
        id: 10101,
        slug: 'ruamchoke_yeekee',
        zone: 'ruamchoke',
      }),

       // Yeekee Heng168

      _.assign({}, yeekeeTemplate, {
        id: 10111,
        slug: 'heng168_yeekee',
        zone: 'heng168'
      }),
      _.assign({}, yeekeeTemplate, {
        id: 10112,
        slug: 'heng168_5min',
        zone: 'heng168',
        total_round: 264,
      }),
    
      // Yeekee Siamlotto

      _.assign({}, yeekeeTemplate, {
        id: 10121,
        slug: 'siamlotto_yeekee',
        zone: 'siamlotto'
      }),
    
      // Yeekee Lotto77

      _.assign({}, yeekeeTemplate, {
        id: 10131,
        slug: 'lotto77_yeekee',
        zone: 'lotto77'
      }),

      // Yeekee HuayLike

      _.assign({}, yeekeeTemplate, {
        id: 10141,
        slug: 'huaylike_yeekee',
        zone: 'huaylike',
      }),
      _.assign({}, yeekeeTemplate, {
        id: 10142,
        slug: 'huaylike_10min',
        zone: 'huaylike',
        total_round: 132,
      }),
      _.assign({}, yeekeeTemplate, {
        id: 10143,
        slug: 'huaylike_5min',
        zone: 'huaylike',
        total_round: 264,
      }),

      // Yeekee Arawanbet

      _.assign({}, yeekeeTemplate, {
        id: 10151,
        slug: 'arawan_yeekee',
        zone: 'arawan',
      }),

      _.assign({}, yeekeeTemplate, {
        id: 10152,
        slug: 'arawan_10min',
        zone: 'arawan',
        total_round: 132,
      }),

      _.assign({}, yeekeeTemplate, {
        id: 10153,
        slug: 'arawan_5min',
        zone: 'arawan',
        total_round: 264,
      }),

      // Yeekee Ruaychoke

      _.assign({}, yeekeeTemplate, {
        id: 10161,
        slug: 'ruaychoke_yeekee',
        zone: 'ruaychoke',
      }),

      // Yeekee 

      // _.assign({}, yeekeeTemplate, {
      //   id: 10171,
      //   slug: '',
      //   zone: '',
      // }),

      // Yeekee Haichoke

      _.assign({}, yeekeeTemplate, {
        id: 10181,
        slug: 'haichoke_yeekee',
        zone: 'haichoke',
      }),


      // Yeekee Jakchoke

      _.assign({}, yeekeeTemplate, {
        id: 10191,
        slug: 'jakchoke_yeekee',
        zone: 'jakchoke',
      }),

      // Yeekee Taweechoke

      _.assign({}, yeekeeTemplate, {
        id: 10201,
        slug: 'taweechoke_yeekee',
        zone: 'taweechoke',
      }),

      // Yeekee Jaosuo

      _.assign({}, yeekeeTemplate, {
        id: 10211,
        slug: 'jaosuo_yeekee',
        zone: 'jaosuo'
      }),
      _.assign({}, yeekeeTemplate, {
        id: 10212,
        slug: 'jaosuo_5min',
        zone: 'jaosuo',
        total_round: 264,
      }),

			// Yeekee Worldlotto
			_.assign({}, yeekeeTemplate, {
        id: 10231,
        slug: 'worldlotto_yeekee',
        zone: 'worldlotto',
      }),
			_.assign({}, yeekeeTemplate, {
        id: 10232,
        slug: 'worldlotto_5min',
        zone: 'worldlotto',
        total_round: 264,
      }),

			// Yeekee Chudjen
			_.assign({}, yeekeeTemplate, {
        id: 10241,
        slug: 'chudjen_yeekee',
        zone: 'chudjen',
      }),
			_.assign({}, yeekeeTemplate, {
        id: 10242,
        slug: 'chudjen_yeekee_vip',
        zone: 'chudjen',
      }),
			_.assign({}, yeekeeTemplate, {
        id: 10243,
        slug: 'chudjen_5min',
        zone: 'chudjen',
        total_round: 264,
      }),
			_.assign({}, yeekeeTemplate, {
        id: 10244,
        slug: 'chudjen_5min_vip',
        zone: 'chudjen',
        total_round: 264,
      }),

      // Yeekee Lottovip

      _.assign({}, yeekeeTemplate, {
        id: 10251,
        slug: 'lottovip_yeekee',
        zone: 'lottovip',
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
