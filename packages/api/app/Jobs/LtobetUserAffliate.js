'use strict'

const _ = use('lodash')
const Helper = make('App/Helper')
const LogRepository = make('App/Repositories/LogRepository')
const LtobetUserRequestRepository = make('App/Repositories/Ltobet/LtobetUserRequestRepository')

class LtobetUserAffliate {

  static get concurrency() {
    return 1
  }

  static get options() {
    return {
      removeOnComplete: true,
    }
  }

  static get key() {
    return 'LtobetUserAffliate-job'
  }

  // This is where the work is done.
  async handle(job) {
    if(Helper.isDebugJob()) console.log(_.get(job, 'queue.name'))
    
    const { data } = job
    
    try {
      const jwtToken = data.jwt_token
      const ltoUserId = data.lto_user_id
      await LtobetUserRequestRepository.getUserAffliate(ltoUserId, jwtToken)

      // console.log('Job Complete : ', ltoUserId)
    } catch (e) {
			const dataLogs = {
				title: 'LtobetUserAffliate-job',
				path: 'app/Jobs',
				channel: 'kue',
				message: e.message,
				data: e,
				params: data
			}
			LogRepository.fire(dataLogs)
    }
  }

  // async onCompleted(job, result) {
  //   // console.log(result)
  //   const ltoUserId = job.data.lto_user_id

  //   console.log('Job Compleate...', ltoUserId)
  // }
}

module.exports = LtobetUserAffliate
