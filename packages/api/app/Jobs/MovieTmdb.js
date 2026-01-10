'use strict'

const _ = use('lodash')
const Helper = make('App/Helper')
const LogRepository = make('App/Repositories/LogRepository')
const MovieRepository = make('App/Repositories/MovieRepository')
const MovieGenreRepository = make('App/Repositories/MovieGenreRepository')
const MoviePersonRepository = make('App/Repositories/MoviePersonRepository')

class MovieTmdb {
  // static get connection() {
  //   return "remote";
  // }

  constructor() {
    this.apiUrl = 'https://api.themoviedb.org/3/'
  }

  static get concurrency() {
    return 1
  }

  static get options() {
    return {
      removeOnComplete: true,
    }
  }

  static get key() {
    return 'MovieTmdb-job'
  }

  // This is where the work is done.
  async handle(job) {
    if(Helper.isDebugJob()) console.log(_.get(job, 'queue.name'))
    
    const { data } = job

		try {
      const movieId = data.id
      const path = this.apiUrl + `movie/${movieId}`
      const optionsMovieEN = {
        qs: {
          language: 'en-US'
        },
      }

      let movie = await Helper.request(path, optionsMovieEN)
      if (!movie)  return

      movie['original_title'] = movie.title
      movie['original_overview'] = movie.overview
      const optionsMovieTH = {
        qs: {
          language: 'th-TH'
        },
      }

      const movieTh = await Helper.request(path, optionsMovieTH)
      if (!movieTh) return 

      movie['title'] = movieTh.title
      movie['overview'] = movieTh.overview
      const movieGenres = movie.genres
      const credits = await Helper.request(path + '/credits')
      if (!credits) return

      await MovieRepository.create(movie)
      for(let i in movieGenres) {
        const movieGenre = movieGenres[i]
        await MovieGenreRepository.create({ movie_id: movieId, genre_id: movieGenre.id })
      }

      const actors = _.get(credits, 'cast') || null
      const crew = _.get(credits, 'crew') || null
      const director = _.find(crew, { job: 'Director' })

      for(let i in actors) {
        const actor = actors[i]
        actor['movie_id'] = movieId
        actor['person_id'] = actor.id
        await MoviePersonRepository.create(actor)
      }
      director['movie_id'] = movieId
      director['person_id'] = director.id
      await MoviePersonRepository.create(director)
		} catch (e) {
			const dataLogs = {
				title: 'MovieTmdb-job',
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

module.exports = MovieTmdb
