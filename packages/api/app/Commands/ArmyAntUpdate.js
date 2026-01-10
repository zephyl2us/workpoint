'use strict'

const { Command } = require('@adonisjs/ace')
const _ = use('lodash')
const moment = use('moment')
const rp = use('request-promise')
const Config = use('Config')
const Bull = use('Bull')
const AdsPowerJob = use('App/Jobs/AdsPower')
const ArmyAntRepository = make('App/Repositories/ArmyAntRepository')

class ArmyAntUpdate extends Command {
  static get signature () {
    return 'ant:update'
  }

  static get description () {
    return 'Tell something helpful about this command'
  }

  async handle (args, options) {
    // this.info('Dummy implementation for movie:update command')
		const filter = {
      // id: 3
    }

    let ants = await ArmyAntRepository
			.browse({ filter: filter })
      // .with('passwords')
      // .limit(1)
			.fetch()

		ants = ants.toJSON()

    // console.log(`Total Ant: `, _.size(ants))
    // console.log(apiUrl)

    for(let i = 0; i < _.size(ants); i++) {
      const ant = ants[i]
      const data = {
        kind: 'update',
        user_id: ant.adspower_id,
        name: `${ant.first_name_en} ${ant.last_name_en}`,
        // name: `${firstName} ${lastName}`,
        // group_id: '0',
        domain_name: "",
        username: "",
        password: "",
        remark: "0.1",
        // cookie: [],
        open_urls: [],
        user_proxy_config: {
          proxy_soft: 'no_proxy'
        },
        fingerprint_config: {
          automatic_timezone: '1',
          language: ['en-US','en','th-TH','th'],
          ua: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
          screen_resolution: '1440_3088'
        }
      }

      // const updateUser = await AdsPowerRepository.updateUser(data)
      Bull.add(AdsPowerJob.key, data)
  
    }
  }

}

module.exports = ArmyAntUpdate
