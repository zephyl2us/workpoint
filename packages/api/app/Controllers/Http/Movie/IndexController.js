'use strict'

const _ = use('lodash')
const Env = use('Env')
const Bull = use('Bull')
const moment = use('moment')
const CryptoJS = use("crypto-js")
const Helper = use('App/Helper')
const Validator = use('Validator')
const MovieValidate = use('App/Validators/Movie')
const MovieTranscodeJob = use('App/Jobs/MovieTranscode')


class IndexController {

	static get inject() {
		return [
			'App/Repositories/Movie/MovieRepository',
			'App/Repositories/Movie/MovieMediaRepository',
			'App/Repositories/Movie/CollectionRepository',
			'App/Repositories/Movie/CompanyRepository',
			'App/Repositories/Movie/GenreRepository',
			'App/Repositories/Movie/PersonRepository',
			'App/Repositories/Movie/SourceRepository',
			'App/Repositories/Movie/ImageRepository',
		]
	}

	constructor(MovieRepository, MovieMediaRepository, CollectionRepository, CompanyRepository, GenreRepository, PersonRepository, SourceRepository, ImageRepository) {
    this.MovieRepository = MovieRepository
    this.MovieMediaRepository = MovieMediaRepository
		this.CollectionRepository = CollectionRepository
		this.CompanyRepository = CompanyRepository
		this.GenreRepository = GenreRepository
		this.PersonRepository = PersonRepository
    this.SourceRepository = SourceRepository

		this.passphrase = "master.movie"
		this.ImageRepository = ImageRepository
	}

	// async setup ({ request, response }) {
	// 	const genres = await this.GenreRepository.browse({}).fetch()

	// 	const data = {

	// 	}

	// 	return response.ok(data)
	// }

  async index ({request, response}) {
		const genres = await this.MovieRepository.getMasterMovie()

		const data = {
			genres: genres,
		}

    return response.ok(this.dataEncrypt(data))
  }

	async search ({ request, response }) {
		const currentPage = request.input('page', 1)
		const search = request.input('search')

		const filter = {
			search: search,
			is_enable: true
		}
		const records = await this.MovieRepository
			.browse({ filter: filter, sort: 'original_title|asc' })
			// .with('source')
			// .with('collection')
			.with('medias')
			.paginate(currentPage, 24)

			return response.status(200).json({
				records: _.get(records.toJSON(), 'data'),
				pagination: Helper.pager(records),
			})
	}
	
	async view ({ request, response, params }) {
		const slug = params.slug
		// console.log(slug)

		const data = await this.MovieRepository.getMasterMovieByMovieSlug(slug)

    return response.ok(this.dataEncrypt(data))
	}

  async genre ({request, params, response}) {
		const currentPage = request.input('page', 1)
		const slug = params.slug

		const genres = await this.GenreRepository.fetch()
		let genre = _.find(genres, ['slug', slug]) || null

		if(_.eq('popular', slug)) {
			genre = {
				slug: 'popular',
				name: 'Popular'
			}
		} else if(_.eq('top_rate', slug)) {
			genre = {
				slug: 'top_rate',
				name: 'Top Rate'
			}
		}

		if(!genre) {
      return response.status(404).json({
        message: 'request.genre.notfound'
      })
		}

		// console.log(genres)

		// const categories = 
		const movies = await this.MovieRepository.findByGenre(genre, currentPage)

		const data = {
			genre: genre,
      records: _.get(movies, 'data'),
      pagination: Helper.pager(movies),
		}

    return response.ok(this.dataEncrypt(data))
  }

	async image({ params, response }) {
		const sizeImage = params.size
		const fileName = params.name

		const result = await this.ImageRepository.getImage(sizeImage, fileName)

		if (result.status === 400) {
			return response.status(result.status).json({
				message: result.message
			})
		}
		
		return response.header('Content-Type', 'image/jpeg').status(result.status).send(result.data)
	}
	
	dataEncrypt (data) {
		if(Helper.isDevMode()) {
			return data
		}

		data = JSON.stringify(data)

    data = CryptoJS.AES.encrypt(data, this.passphrase).toString()
		return { hash: data }
	}
}

module.exports = IndexController
