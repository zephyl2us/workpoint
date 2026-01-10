'use strict'

const _ = use('lodash')
const moment = use('moment')
const Task = use('Task')
const Bull = use('Bull')
const Helper = use('App/Helper')
const LogRepository = make('App/Repositories/LogRepository')
const LtobetUserAffliateJob = use('App/Jobs/LtobetUserAffliate')
const LtobetUserRepository = make('App/Repositories/Ltobet/LtobetUserRepository')

class LtobetUserAffliate extends Task {
  static get schedule () {
    return '29,59 */1 * * *'
    // return '0 */5 * * * *'
  }

  async handle () {
    if(Helper.isDevMode()) console.log('Scheduler : Ltobet Affliate every 30 Minute. (29,59)')

    let ltoUsers = await LtobetUserRepository.browse()
    .select(['lto_user_id', 'jwt_token'])
    .where('enabled', 1)
    .fetch()

    ltoUsers = ltoUsers.toJSON()

    try {
      for (const ltoUser of ltoUsers) {
        Bull.add(LtobetUserAffliateJob.key, { lto_user_id: ltoUser.lto_user_id , jwt_token: ltoUser.jwt_token })
      }

    } catch (e) {
			const dataLogs = {
        title: 'LtobetUserAffliate-Task',
        path: 'App/Tasks/LtobetUserAffliate',
        channel: 'tasks',
        message: e.message,
				data: e,
      }
			LogRepository.fire(dataLogs)
    }
  }
}

module.exports = LtobetUserAffliate
