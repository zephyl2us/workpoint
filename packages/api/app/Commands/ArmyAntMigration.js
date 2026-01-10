'use strict'

const { Command } = require('@adonisjs/ace')
const _ = use('lodash')
const moment = use('moment')
const rp = use('request-promise')
const Config = use('Config')
const Bull = use('Bull')
const ArmyMigrationToUndetectJob = use('App/Jobs/Example/ArmyMigrationToUndetect')
const ArmyAntRepository = make('App/Repositories/ArmyAntRepository')

const apiUrl = 'https://adspower-01.megatron.team'

class ArmyAntMigration extends Command {
  static get signature () {
    return 'ant:migration'
  }

  static get description () {
    return 'Tell something helpful about this command'
  }

  async handle (args, options) {
    // this.info('Dummy implementation for movie:update command')
		const filter = {
      undetect_id: null
    }

    let ants = await ArmyAntRepository
			.browse({ filter: filter, sort: 'id|asc' })
      // .limit(10)
			.fetch()

		ants = ants.toJSON()

    // console.log(`Total Ant: `, _.size(ants))
    // console.log(apiUrl)

    const response = await this.request('/api/v1/user/list', {
      page: 1,
      page_size: 1000
    })

    const powerUsers = _.get(response, 'data.list')

    // console.log(`Total Power User: `, _.size(powerUsers))
    // const powerUserIds = _.map(powerUsers, (user) => user.user_id)

    
    const adsPowerGroups = {}
    _.each(powerUsers, (user) => {
      const uid = _.get(user, 'user_id')
      const groupName = _.get(user, 'group_name')

      // console.log(uid, groupName)

      if(uid) {
        adsPowerGroups[uid] = groupName
      }
    })

    // console.log(adsPowerGroups)

		for(let i = 0; i < _.size(ants); i++) {
      const ant = ants[i]
      const armyAntId = _.get(ant, 'id')
      const adsPowerId = _.get(ant, 'adspower_id')
      let groupName = _.get(adsPowerGroups, adsPowerId)

      // console.log(adsPowerId, groupName)

      groupName = _.replace(groupName, `G Testing`, 'Mr.G')
      
      const groups = ['EMP', 'NBC', 'TMB', 'Mr.K', 'Mr.G']
      if(!_.includes(groups, groupName)) {
        groupName = null
      }

      Bull.add(ArmyMigrationToUndetectJob.key, {
        army_ant_id: armyAntId,
        tags: [groupName]
      })
    }
    // const response = await this.request('/api/v1/user/list', {
    //   page: 1,
    //   page_size: 1000
    // })

    // const powerUsers = _.get(response, 'data.list')

    // console.log(`Total Power User: `, _.size(powerUsers))
    // const powerUserIds = _.map(powerUsers, (user) => user.user_id)
    // // const powerUserEmails = _.map(powerUsers, (user) => user.user_id)
    // // console.log(powerUserIds)

    // let totalDelete = 0
		// for(let i = 0; i < _.size(ants); i++) {
    //   const ant = ants[i]
    //   const refId = _.get(ant, 'ref_id')

    //   if(!refId) {
    //     continue
    //   }

    //   if(_.includes(powerUserIds, refId)) {
    //     continue
    //   }

    //   console.log(`Deleted #${ant.id}: ${refId}`)
    //   totalDelete++


    //   const antUser = await ArmyAntRepository.findBy('id', ant.id)
    //   const deleted = await ArmyAntRepository.delete(antUser)
    // }

    // console.log(`Total Delete: ${totalDelete}`)

  }

  async request(path, params) {
    const requestUrl = `${apiUrl}${path}`
    // console.log(requestUrl)
    let requestOptions = {
      method: 'GET',
      uri: requestUrl,
      headers: {
        accept: 'application/json',
      },
      qs: _.assign({}, params),
      json:true
    }

    // console.log(requestOptions)

    const result = await rp(requestOptions)
    .then(res => {
      return res
    }).error(e => {
      return false
    })

    return result
  }

}

module.exports = ArmyAntMigration
