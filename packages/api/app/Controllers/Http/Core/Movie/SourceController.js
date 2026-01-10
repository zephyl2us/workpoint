'use strict'

const _ = use('lodash')
const Bull = use('Bull')
const Block = use('Block')
const moment = use('moment')
const Helper = use('App/Helper')
const Validator = use('Validator')
const MovieValidate = use('App/Validators/Movie')
const MovieSourceSyncJob = use('App/Jobs/MovieSourceSync')


class SourceController {

	static get inject() {
		return [
			'App/Repositories/Movie/MovieRepository',
			'App/Repositories/Movie/SourceRepository',
		]
	}

	constructor(MovieRepository, SourceRepository) {
		this.MovieRepository = MovieRepository
    this.SourceRepository = SourceRepository
    // this.TmdbRepository = TmdbRepository
	}

  async index ({request, response}) {
		const currentPage = request.input('page', 1)
		const linked = request.input('linked')

		// const filters = request.only(['search'])
		// const sort = request.input('sort', 'id|desc')

		const filter = _.assign({}, request.only(['search', 'movie_id']), {
			linked: linked ? ((linked === 'true') ? true : false) : null
		})

    let sources = await this.SourceRepository.browse({filter: filter}).paginate(currentPage)

    return response.status(200).json({
      records: _.get(sources.toJSON(), 'data'),
      pagination: Helper.pager(sources),
    })
  }

	async sync ({ request, response }) {
		const duration = 1 * 60
		const key = `request:store:movie:source`
		const blockDuration = await Block.exists(key, duration)
		// console.log(blockDuration)

		if (blockDuration) {
			const ttl = await Block.ttl(key)
			response.status(429).json({
				status: 'error', 
				message: 'Too Many Sync',
				code: `movie.source.too_many_sync`,
				duration: ttl
			})
			return
		}

    Bull.add(MovieSourceSyncJob.key, {})
    
    return response.status(200).json({
			duration: duration
		})
	}


  async link ({ request, params, response }) {
    const { id } = params
    const movieRefId = request.input('movie_ref_id')

    const movie = await this.MovieRepository.findBy('ref_id', movieRefId)
		// console.log(movieRefId)

    if(!movie) {
      return response.status(404).json({
        message: 'request.error1'
      })
    }

    const source = await this.SourceRepository.find(id)

    if(!source) {
      return response.status(404).json({
        message: 'request.error'
      })
    }

    const movieId = movie.id

    await this.SourceRepository.update(source, {
      mdb_movie_id: movieId
    })

    return {
      record: source,
    }
  }

}

module.exports = SourceController
