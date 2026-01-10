'use strict'

const _ = use('lodash')
const moment = use('moment')

const LogRepository = make('App/Repositories/LogRepository')
const ArmyAntRepository = make('App/Repositories/ArmyAntRepository')
const ArmyAntBotRepository = make('App/Repositories/ArmyAntBotRepository')

class ArmyMigrationToUndetect {
  // static get connection() {
  //   return "remote";
  // }

  static get concurrency() {
    return 1
  }

  static get options() {
    return {
      removeOnComplete: true,
    }
  }

  static get key() {
    return 'ArmyMigrationToUndetect-job'
  }

  // This is where the work is done.
  async handle(job) {
    const { data } = job
    const armyAntId = data.army_ant_id
    const group = _.get(data, 'group')
    const tags = _.get(data, 'tags')
    const folder = _.get(data, 'folder')

    // await new Promise(r => setTimeout(r, 2000))
    
		try {
      const ant = await ArmyAntRepository.findBy('id', armyAntId)
      if(!ant) {
        console.log(`Cann't find ant #${armyAntId}`)
      }

      const addons = {
        group: group,
        tags: tags,
        folder: folder
      }
  
      const antBot = await ArmyAntBotRepository.createByAnt(ant, addons)
  
      if(!antBot) {
        console.log('Create farm failed')
      }
  
      const profileId = _.get(antBot, 'data.profile_id')
  
      if(profileId) {
        await ArmyAntRepository.update(ant, {
          undetect_id: profileId
        })
  
        const toCloudResult = await ArmyAntBotRepository.sendToCloudById(profileId)
  
        if(toCloudResult) {
          await ArmyAntRepository.update(ant, {
            type: 'cloud'
          })
        }
      }
  
		} catch (e) {
			const dataLogs = {
				title: 'ArmyMigrationToUndetect-job',
				path: 'app/Jobs',
				channel: 'kue',
				message: e.message,
				data: e,
				params: data
			}
			LogRepository.fire(dataLogs)
		}
  }

  async onCompleted(job, result) {
    // console.log('Job Compleate...', result)
  }
}

module.exports = ArmyMigrationToUndetect
