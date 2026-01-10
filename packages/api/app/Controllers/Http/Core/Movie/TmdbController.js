'use strict'

const _ = use('lodash')
const moment = use('moment')
const Validator = use('Validator')
const MovieValidate = use('App/Validators/Movie')
const Bull = use('Bull')
const MovieTmdbVideoJob = use('App/Jobs/MovieTmdbVideo')


class TmdbController {

	static get inject() {
		return [
			'App/Repositories/Movie/MovieRepository',
			'App/Repositories/Movie/SourceRepository',
			'App/Repositories/Movie/TmdbRepository',
			'App/Repositories/Movie/TmdbRequestRepository',
		]
	}

	constructor(MovieRepository, SourceRepository, TmdbRepository, TmdbRequestRepository) {
    this.MovieRepository = MovieRepository
		this.SourceRepository = SourceRepository
		this.TmdbRepository = TmdbRepository
    this.TmdbRequestRepository = TmdbRequestRepository
	}

  async search ({request, response}) {
    const { search, year, page } = request.only(['search', 'year', 'page'])

    const path = 'search/movie'
    let params = {
      query: search,
      primary_release_year: year,
      page: page,
      language: 'th-TH'
    }

    // console.log(params)

    const result = await this.TmdbRequestRepository.request(path, params)

    if (!result) {
      return response.status(400).json({
        message: 'request.error'
      })
    }

    const records = _.get(result, 'results')

    const refIds = _.map(records, (record) => record.id)

    const filter = {
      ref_ids: refIds
    }

    const movies = await this.MovieRepository
      .browse({ filter: filter })
      .select(['id', 'ref_id'])
      .fetch()

    // console.log(result)

    return response.status(200).json({
      records: records,
      movies: movies,
      pagination: {
        current_page: page,
        last_page: _.get(result, 'total_pages'),
        per_page: 20,
        total: _.get(result, 'total_results'),
      }
    })
  }
  
  async syncMovie ({ request, params, response }) {
    const { id } = params
    const sourceId = request.input('source_id')

    const requestMovie = await this.TmdbRequestRepository.requestMovieById(id)
    const requestMovieTh = await this.TmdbRequestRepository.requestMovieById(id, { language: 'th-TH'})
    const requestMovieCredits = await this.TmdbRequestRepository.requestCreditsByMovieId(id)

    // console.log(`requestMovie Completed`)

    if(!requestMovie || !requestMovieTh || !requestMovieCredits) {
      return response.status(404).json({
        message: 'request.error'
      })
    }

    const movie = await this.MovieRepository.findBy('ref_id', id)

    if(movie) {
      return response.status(409).json({
        message: 'request.conflict'
      })
    }

    const data = {
      ref_id: id,
      imdb_id: _.get(requestMovie, 'imdb_id'),

      original_title: _.get(requestMovie, 'title'),
      original_overview: _.get(requestMovie, 'overview'),
      original_language: _.get(requestMovie, 'original_language'),
      title: _.get(requestMovieTh, 'title'),
      overview: _.get(requestMovieTh, 'overview'),

      budget: _.get(requestMovie, 'budget'),
      revenue: _.get(requestMovie, 'revenue'),
      runtime: _.get(requestMovie, 'runtime'),
      release_date: _.get(requestMovie, 'release_date'),

      backdrop_path: _.get(requestMovieTh, 'backdrop_path'),
      poster_path: _.get(requestMovieTh, 'poster_path'),

      popularity: _.get(requestMovie, 'popularity'),
      vote_average: _.get(requestMovie, 'vote_average'),
      vote_count: _.get(requestMovie, 'vote_count'),
    }

    const createdMovie = await this.MovieRepository.create(data)
    const movieId = createdMovie.id

    if(sourceId) {
      const source = await this.SourceRepository.find(sourceId)

      if(source) {
        await this.SourceRepository.update(source, {
          mdb_movie_id: movieId
        })
      }
    }

    // const movieId = 385687

    const genres = _.get(requestMovie, 'genres')
    await this.TmdbRepository.createMovieGenresByMovieId(movieId, genres)
    // console.log(`createdGenres Completed`)

    const productionCompanies = _.get(requestMovie, 'production_companies')
    await this.TmdbRepository.createMovieCompaniesByMovieId(movieId, productionCompanies)
    // console.log(`createdCompanies Completed`)
    
    const collection = _.get(requestMovie, 'belongs_to_collection')
    await this.TmdbRepository.createMovieCollectionByMovieId(movieId, collection)
    // console.log(`createdCollection Completed`)

    const castCredits = _.get(requestMovieCredits, 'cast')
    await this.TmdbRepository.createMovieCreditsByMovieId(movieId, 'cast', castCredits)
    // console.log(`createdCastCredits Completed`)

    const crewCredits = _.get(requestMovieCredits, 'crew')
    await this.TmdbRepository.createMovieCreditsByMovieId(movieId, 'crew', crewCredits)
    // console.log(`createdCrewCredits Completed`)

    await this.TmdbRepository.createMovieVideoByMovieId(movieId, { id: id })

    return {
      record: createdMovie,
      // movie: data,
      // collection: collection,
      // genres: genres,
      // production_companies: productionCompanies,
      // credits: requestMovieCredits
    }
  }

  async syncCredit ({ request, response }) {
    
  }

  async syncPerson ({ request, response }) {
    
  }
}

module.exports = TmdbController
