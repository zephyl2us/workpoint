'use strict'

const _ = use('lodash')
const Config = use('Config')
const Helper = make('App/Helper')
const LogRepository = make('App/Repositories/LogRepository')
const CompanyRepository = make('App/Repositories/Movie/CompanyRepository')
// const TmdbRepository = make('App/Repositories/Movie/TmdbRepository')
const TmdbRequestRepository = make('App/Repositories/Movie/TmdbRequestRepository')

class MovieTmdbCompany {
  static get concurrency() {
    return 1
  }

  static get options() {
    return {
      removeOnComplete: true,
    }
  }

  static get key() {
    return 'MovieTmdbCompany-job'
  }

  // This is where the work is done.
  async handle(job) {
    if(Helper.isDebugJob()) console.log(_.get(job, 'queue.name'))
    
    const { data } = job

		const delay = Config.get(`movie.tmdbDelay`)
    await new Promise(r => setTimeout(r, delay))

		try {
      const id = data.id

      const requestCompany = await TmdbRequestRepository.requestCompanyById(id)

      let company = await CompanyRepository.findBy('ref_id', id)

      let record = _.assign({ ref_id: requestCompany.id }, _.pick(requestCompany, [
        'name',
        'headquarters',
        'origin_country',
        'homepage',
        'logo_path',
      ]))

      if(!_.get(company, 'id')) {
        return
      }
      
      company = await CompanyRepository.update(company, record)

		} catch (e) {
			const dataLogs = {
				title: 'MovieTmdbCompany-job',
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

module.exports = MovieTmdbCompany
