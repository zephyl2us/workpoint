'use strict'

const _ = use('lodash')
const Config = use('Config')
const Helper = make('App/Helper')
const LogRepository = make('App/Repositories/LogRepository')
const MovieRepository = make('App/Repositories/Movie/MovieRepository')
const TmdbRepository = make('App/Repositories/Movie/TmdbRepository')
const TmdbRequestRepository = make('App/Repositories/Movie/TmdbRequestRepository')

class MovieTmdbUpdate {
  static get concurrency() {
    return 1
  }

  static get options() {
    return {
      removeOnComplete: true,
    }
  }

  static get key() {
    return 'MovieTmdbUpdate-job'
  }

  // This is where the work is done.
  async handle(job) {
    if(Helper.isDebugJob()) console.log(_.get(job, 'queue.name'))
    
    const { data } = job

		const delay = Config.get(`movie.tmdbDelay`)
    await new Promise(r => setTimeout(r, delay))

		try {
      const id = data.id

      const requestMovie = await TmdbRequestRepository.requestMovieById(id, { language: 'th-TH'})
      const requestMovieCredits = await TmdbRequestRepository.requestCreditsByMovieId(id)

      if(!requestMovie || !requestMovieCredits) {
        return
      }

      let movie = await MovieRepository.findBy('ref_id', id)

      let record = _.assign({ ref_id: requestMovie.id }, _.pick(requestMovie, [
        'poster_path',
        'popularity',
        'revenue',
        'vote_average',
        'vote_count',
      ]))

      if(!_.get(movie, 'id')) {
        return
      }

      const movieId = movie.id
      movie = await MovieRepository.update(movie, record)

      const castCredits = _.get(requestMovieCredits, 'cast')
      await TmdbRepository.createMovieCreditsByMovieId(movieId, 'cast', castCredits)
      // console.log(`createdCastCredits Completed`)
  
      const crewCredits = _.get(requestMovieCredits, 'crew')
      await TmdbRepository.createMovieCreditsByMovieId(movieId, 'crew', crewCredits)
      
		} catch (e) {
			const dataLogs = {
				title: 'MovieTmdbUpdate-job',
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

module.exports = MovieTmdbUpdate
