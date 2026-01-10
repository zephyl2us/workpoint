'use strict'

const _ = use('lodash')
const Bull = use('Bull')
const moment = use('moment')
const Helper = use('App/Helper')
const Validator = use('Validator')
const MovieValidate = use('App/Validators/Movie')
const MovieTranscodeJob = use('App/Jobs/MovieTranscode')


class MovieController {

	static get inject() {
		return [
			'App/Repositories/Movie/MovieRepository',
			'App/Repositories/Movie/MovieMediaRepository',
			'App/Repositories/Movie/CollectionRepository',
			'App/Repositories/Movie/CompanyRepository',
			'App/Repositories/Movie/GenreRepository',
			'App/Repositories/Movie/PersonRepository',
			'App/Repositories/Movie/SourceRepository',
		]
	}

	constructor(MovieRepository, MovieMediaRepository, CollectionRepository, CompanyRepository, GenreRepository, PersonRepository, SourceRepository) {
    this.MovieRepository = MovieRepository
    this.MovieMediaRepository = MovieMediaRepository
		this.CollectionRepository = CollectionRepository
		this.CompanyRepository = CompanyRepository
		this.GenreRepository = GenreRepository
		this.PersonRepository = PersonRepository
    this.SourceRepository = SourceRepository
	}

  async index ({request, response}) {
		const currentPage = request.input('page', 1)
		// const search = request.input('search')

		// const filters = request.only(['search'])
		// const sort = request.input('sort', 'id|desc')

		const filter = _.assign({}, request.only(['search']), {
		})

    let movies = await this.MovieRepository
			.browse({ filter: filter })
			.with('source')
			.with('collection')
			.with('medias')
			// .with('collection', (builder) => {
			// 	builder.with('collection')
			// 	// builder.innerJoin('mdb_collections', 'mdb_movie_collections.mdb_collection_id', 'mdb_collections.id')
			// })
			.paginate(currentPage)

		let records = _.get(movies.toJSON(), 'data')

		// console.log(records)

		// Get Collections
		let collectionIds = _.map(records, (movie) => _.get(movie, 'collection.mdb_collection_id'))
		collectionIds = _.filter(collectionIds, (id) => id)
		collectionIds = _.uniq(collectionIds)

		let collections = await this.CollectionRepository.browse({ filter: {
			ids: collectionIds
		}}).fetch()
		collections = collections.toJSON()

		_.each(records, (movie, index) => {
			const collectionId = _.get(movie, 'collection.mdb_collection_id')
			if(collectionId) {
				const collectionIndex = _.findIndex(collections, ['id', collectionId])
				const collection = _.get(collections, collectionIndex)
				movie.collection = _.pick(collection, ['id', 'original_name', 'name', 'poster_path']) || null
			}
		})

    return response.status(200).json({
      records: records,
      pagination: Helper.pager(movies),
    })
  }
	
	async view ({ request, response, params }) {
		const id = params.id

		const filter = {
			id: id
		}

		let movie = await this.MovieRepository
			.browse({ filter: filter })
			.with('credits')
			.with('collection')
			.with('companies')
			.with('genres')
			.with('source')
			.with('medias')
			.first()

    if(!movie) {
      return response.status(404).json({
        message: 'request.movie.notfound'
      })
    }

		movie = movie.toJSON()

		// Get Movie Collections
		const movieCollection = _.get(movie, 'collection')
		const collectionId = _.get(movieCollection, 'mdb_collection_id')

		let collection = null

		if(collectionId) {
			collection = await this.CollectionRepository.find(collectionId)
		}


		// Get Movie Credits
		const movieCredits = _.get(movie, 'credits')
		const personIds = _.map(movieCredits, (obj) => obj.mdb_person_id)

		let people = await this.PersonRepository.browse({ filter: {
			ids: personIds
		}}).fetch()
		people = people.toJSON()

		// Get Movie Companies
		const movieCompanies = _.get(movie, 'companies')
		const companyIds = _.map(movieCompanies, (obj) => obj.mdb_company_id)

		let companies = await this.CompanyRepository.browse({ filter: {
			ids: companyIds
		}}).fetch()
		companies = companies.toJSON()

		// Get Movie Genres
		const movieGenres = _.get(movie, 'genres')
		const genreIds = _.map(movieGenres, (obj) => obj.mdb_genre_id)
		// console.log(genreIds)

		let genres = await this.GenreRepository.browse({ filter: {
			ids: genreIds
		}}).fetch()
		genres = genres.toJSON()

    return response.status(200).json({
      record: movie,
			collection: collection,
			companies: companies,
			genres: genres,
			people: people,
    })
	}

	async update ({ auth, request, response, params }) {
		const movieId = params.id
		const movie = await this.MovieRepository.findBy('id', movieId)

    if(!_.get(movie, 'id')) {
      return response.status(400).json({
        code: 'query.not_found',
        message: 'Movie not found'
      })
    }

		const props = request.all()

		const slug = request.input('slug')
		const movieBySlug = await this.MovieRepository.findBy('slug', slug)

		const movieBySlugId = _.get(movieBySlug, 'id')
		if(movieBySlugId) {
			if(movieBySlugId != movieId) {
				return response.status(400).json({
					code: 'movie.slug_duplicate',
					message: 'Slug duplicated'
				})
			}
		}
		
		
		const updated = await this.MovieRepository.update(movie, props)

    if(!updated) {
      return response.status(400).json({
        code: 'nothing_update',
        message: 'Nothing Update'
      })
    }

		return response.ok({
			status: 'success',
			code: 'movie_updated',
			record: updated
		})
	}

	async media ({ request, response, params }) {
		const movieId = params.id
		const resolution = params.resolution
		const ip = request.header('cf-connecting-ip') || request.ip()

		const filter = {
			id: movieId
		}

		let movie = await this.MovieRepository
			.browse({ filter: filter })
			.with('credits')
			.with('collection')
			.with('companies')
			.with('genres')
			.with('source')
			.with('medias')
			.first()

    if(!movie) {
      return response.status(404).json({
        message: 'request.movie.notfound'
      })
    }

		movie = movie.toJSON()

		const medias = _.get(movie, 'medias')

		const index = _.findIndex(medias, ['resolution', resolution])

		if(index === -1) {
      return response.status(404).json({
        message: 'request.movie.notfound'
      })
		}

		const media = medias[index]
		const hash = media.hash

		const path = `${hash}-${resolution}`

		const url = Helper.wowzaEncodeUrl(request, path)

    return response.status(200).json({
      url: `https://65fff4186fb76.streamlock.net/${url}`,
			ip: ip
    })
	}


	async transcode ({ auth, request, params, response }) {
		const authUser = auth.user
		const userId = authUser.id
		const id = params.id
		const resolution = request.input('resolution')
		const audios = request.input('audios')

		const filter = {
			id: id
		}

		let movie = await this.MovieRepository
			.browse({ filter: filter })
			.with('source')
			.first()

    if(!movie) {
      return response.status(404).json({
        message: 'request.movie.notfound'
      })
    }

		movie = movie.toJSON()

		const sourceId = _.get(movie, 'source.id')
    if(!sourceId) {
      return response.status(404).json({
        message: 'request.movie.source_notfound'
      })
    }

		let media = await this.MovieMediaRepository
			.browse({
				filter: {
					movie_id: id,
					resolution: resolution
				}
			})
			.first()

    if(media) {
      return response.status(404).json({
        message: 'request.movie.media_duplicated'
      })
    }

    const source = await this.SourceRepository.find(sourceId)
    await this.SourceRepository.update(source, {
      transcode_audio: audios
    })


		const hash = _.get(movie, 'source.hash')
		const mediaCreated = await this.MovieMediaRepository.create({
			mdb_movie_id: id,
			mdb_source_id: sourceId,
			hash: hash,
			transcode_audio: audios,
			resolution: resolution,
			created_user_id: userId
		})

		const transcode = {
			movie: movie,
			resolution: resolution,
			audios: audios
		}

		Bull.add(MovieTranscodeJob.key, {
			id: mediaCreated.id,
			audios: audios
		})


		return mediaCreated

	}
}

module.exports = MovieController
