'use strict'

const _ = use('lodash')
const Config = use('Config')
const langdetect = use('langdetect')
const Helper = make('App/Helper')
const LogRepository = make('App/Repositories/LogRepository')
const PersonRepository = make('App/Repositories/Movie/PersonRepository')
// const TmdbRepository = make('App/Repositories/Movie/TmdbRepository')
const TmdbRequestRepository = make('App/Repositories/Movie/TmdbRequestRepository')

class MovieTmdbPerson {
  static get concurrency() {
    return 1
  }

  static get options() {
    return {
      removeOnComplete: true,
    }
  }

  static get key() {
    return 'MovieTmdbPerson-job'
  }

  // This is where the work is done.
  async handle(job) {
    if(Helper.isDebugJob()) console.log(_.get(job, 'queue.name'))
    
    const { data } = job

		const delay = Config.get(`movie.tmdbDelay`)
    await new Promise(r => setTimeout(r, delay))

		try {
      const id = data.id

      const requestPerson = await TmdbRequestRepository.requestPersonById(id, { language: 'th-TH'})

      let person = await PersonRepository.findBy('ref_id', id)

      let record = _.assign({ ref_id: requestPerson.id }, _.pick(requestPerson, [
        'birthday',
        'place_of_birth',
        'deathday',
        'biography',
        'profile_path',
        'popularity',
      ]))

      const genders = {
        1: 'female',
        2: 'male'
      }

      const gender = _.get(genders, _.get(requestPerson, 'gender')) || 'other'
      record.gender = gender
      
      const alsoKnownAs = _.get(requestPerson, 'also_known_as')
      // console.log(alsoKnownAs)

      let nameTh = ''
      _.each(alsoKnownAs, (name) => {
        const languages = langdetect.detect(name)
        const lang = _.get(languages, `0.lang`)
        if(_.eq('th', lang)) {
          nameTh = name
          return false
        }
      })

      if(nameTh) {
        record.name = nameTh
      }


      if(!_.get(person, 'id')) {
        return
      }
      
      person = await PersonRepository.update(person, record)

		} catch (e) {
			const dataLogs = {
				title: 'MovieTmdbPerson-job',
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

module.exports = MovieTmdbPerson
