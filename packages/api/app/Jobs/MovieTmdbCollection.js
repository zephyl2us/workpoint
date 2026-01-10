'use strict'

const _ = use('lodash')
const Config = use('Config')
const Helper = make('App/Helper')
const LogRepository = make('App/Repositories/LogRepository')
const CollectionRepository = make('App/Repositories/Movie/CollectionRepository')
// const TmdbRepository = make('App/Repositories/Movie/TmdbRepository')
const TmdbRequestRepository = make('App/Repositories/Movie/TmdbRequestRepository')

class MovieTmdbCollection {
  static get concurrency() {
    return 1
  }

  static get options() {
    return {
      removeOnComplete: true,
    }
  }

  static get key() {
    return 'MovieTmdbCollection-job'
  }

  // This is where the work is done.
  async handle(job) {
    if(Helper.isDebugJob()) console.log(_.get(job, 'queue.name'))
    
    const { data } = job

		const delay = Config.get(`movie.tmdbDelay`)
    await new Promise(r => setTimeout(r, delay))

		try {
      const id = data.id

      const requestCollection = await TmdbRequestRepository.requestCollectionById(id, { language: 'th-TH'})

      let collection = await CollectionRepository.findBy('ref_id', id)

      let record = _.assign({ ref_id: requestCollection.id }, _.pick(requestCollection, [
        'original_name',
        'name',
        'poster_path',
        'backdrop_path',
        'parts',
      ]))

      if(!_.get(collection, 'id')) {
        return
      }

      collection = await CollectionRepository.update(collection, record)
		} catch (e) {
			const dataLogs = {
				title: 'MovieTmdbCollection-job',
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

module.exports = MovieTmdbCollection
