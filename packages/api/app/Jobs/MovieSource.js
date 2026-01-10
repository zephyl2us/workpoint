'use strict'

const _ = use('lodash')
const Env = use('Env')
const ffmpeg = use('fluent-ffmpeg')
const Helper = make('App/Helper')
const LogRepository = make('App/Repositories/LogRepository')
const SourceRepository = make('App/Repositories/Movie/SourceRepository')

class MovieSource {
  static get concurrency() {
    return 1
  }

  static get options() {
    return {
      removeOnComplete: true,
    }
  }

  static get key() {
    return 'MovieSource-job'
  }

  // This is where the work is done.
  async handle(job) {
    if(Helper.isDebugJob()) console.log(_.get(job, 'queue.name'))
    
    const { data } = job

		try {
      // await new Promise(r => setTimeout(r, 10))

      const movie = await SourceRepository.syncMovie(data)

      // console.log(data)

		} catch (e) {
			const dataLogs = {
				title: 'MovieSource-job',
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

module.exports = MovieSource
