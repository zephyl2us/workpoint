'use strict'

const _ = use('lodash')
const Config = use('Config')
const Redis = use('Redis')
const moment = use('moment')
const Helper = use('App/Helper')
const Database = use('Database')


class MovieRepository {

  static get inject() {
    return [
      'App/Models/MdbMovie',
      'App/Models/MdbMovieGenre',
      'App/Models/MdbMovieCompany',
      'App/Models/MdbMovieCollection',
      'App/Models/MdbMovieCredit',
      'App/Models/MdbMovieVideo',
			'App/Repositories/Movie/CollectionRepository',
			'App/Repositories/Movie/CompanyRepository',
			'App/Repositories/Movie/GenreRepository',
			'App/Repositories/Movie/PersonRepository',
    ]
  }

  constructor(MdbMovie, MdbMovieGenre, MdbMovieCompany, MdbMovieCollection, MdbMovieCredit, MdbMovieVideo, CollectionRepository, CompanyRepository, GenreRepository, PersonRepository) {
    this.Movie = MdbMovie
    this.MovieGenre = MdbMovieGenre
    this.MovieCompany = MdbMovieCompany
    this.MovieCollection = MdbMovieCollection
    this.MovieCredit = MdbMovieCredit
    this.MovieVideo = MdbMovieVideo
		this.CollectionRepository = CollectionRepository
		this.CompanyRepository = CompanyRepository
		this.GenreRepository = GenreRepository
		this.PersonRepository = PersonRepository

    this.Redis = Redis.connection('temp')
    this.cacheMovieDuration = Config.get('movie.cacheDuration')
  }
  
	browse({ filter = {}, sort = 'id|desc', options = { db: 'write' } } = {}) {
		const sorter = Helper.convertSplitterToObject(sort)
		const CurrentModel = Helper.clusterDb('MdbMovie', {
			mode: options.db
		})

		return CurrentModel.query().filter(filter).sorter(sorter)
	}

	async find(id) {
    return await this.Movie.find(id)
	}

	async findBy(field, value) {
		return await this.Movie.findBy(field, value)
	}

  async create(data) {
    let movie = new this.Movie()

    movie = _.assign(movie, _.pick(data, [
      'ref_id',
      'imdb_id',

      'original_title',
      'original_overview',
      'original_language',
      'title',
      'overview',

      'budget',
      'revenue',
      'runtime',
      'release_date',

      'backdrop_path',
      'poster_path',

      'popularity',
      'vote_average',
      'vote_count',
    ]))

    if(await movie.save()) {
      return movie
    }
    return false
  }

  async update(movie, data) {

    movie = _.assign(movie, _.pick(data, [
      'slug',
      'original_title',
      'title',
      'original_overview',
      'overview',
      'budget',
      'revenue',
      'runtime',
      'release_date',
      'backdrop_path',
      'poster_path',
      'popularity',
      'vote_average',
      'vote_count',
      'is_enable',
    ]))
    
    if (await movie.save()) {
      return movie
    }

    return false
  }

  async createGenre (movieId, genreId) {
    let movieGenre = new this.MovieGenre()

    movieGenre.mdb_movie_id = movieId
    movieGenre.mdb_genre_id = genreId

    if(await movieGenre.save()) {
      return movieGenre
    }
    return false
  }

  async createCompany (movieId, companyId) {
    let movieCompany = new this.MovieCompany()

    movieCompany.mdb_movie_id = movieId
    movieCompany.mdb_company_id = companyId

    if(await movieCompany.save()) {
      return movieCompany
    }
    return false
  }

  async createCollection (movieId, collectionId) {
    let movieCollection = new this.MovieCollection()

    movieCollection.mdb_movie_id = movieId
    movieCollection.mdb_collection_id = collectionId

    if(await movieCollection.save()) {
      return movieCollection
    }
    return false
  }

  async createCredit (movieId, personId, data) {
    let movieCredit = new this.MovieCredit()

    movieCredit.mdb_movie_id = movieId
    movieCredit.mdb_person_id = personId

    movieCredit = _.assign(movieCredit, data)

    if(await movieCredit.save()) {
      return movieCredit
    }
    return false
  }

  async createOrUpdateCredit (movieId, personId, data) {
    const refId = data.ref_id

    let movieCredit = await this.MovieCredit.findBy('ref_id', refId)

    if(!movieCredit) {
      movieCredit = new this.MovieCredit()
    }

    movieCredit.mdb_movie_id = movieId
    movieCredit.mdb_person_id = personId

    movieCredit = _.assign(movieCredit, data)

    if(await movieCredit.save()) {
      return movieCredit
    }
    return false
  }

  async createVideo (movieId, data) {
    let movieVideo = new this.MovieVideo()

    movieVideo.mdb_movie_id = movieId

    movieVideo = _.assign(movieVideo, data)

    if(await movieVideo.save()) {
      return movieVideo
    }
    return false
  }

  async getVideoById (videoId) {
    
  }

  getByGenreId (genreId) {
    let query = this.MovieGenre.query()
    // query.select('*')
    query.select('mdb_movie_genres.mdb_movie_id', 'mdb_movie_genres.mdb_genre_id', 'mdb_movies.*')
    query.leftJoin('mdb_movies', 'mdb_movies.id', 'mdb_movie_genres.mdb_movie_id')
    query.where('mdb_genre_id', genreId)
    query.where('is_enable', 1)
    // query.fetch()

    // let movies = await query.fetch()

    return query
  }

  async findByGenre (genre, page) {
    const slug = genre.slug
		const cacheKey = `movie:master.movie:genres:${slug}:${page}`
		let cached = await this.Redis.get(cacheKey)

		if (!cached) {
      let movies = []
      if(_.eq('popular', slug)) {
        movies = await this.browse({ filter: {
          // Filter
          is_enable: true
        }, sort: 'popularity|desc'})
        .where('popularity', '>', 50)
        .limit(240)
        .paginate(page, 24)
        
        movies = this.setMaxPage(movies, 10)
      } else if(_.eq('top_rate', slug)) {
        movies = await this.browse({ filter: {
          // Filter
          is_enable: true
        }, sort: 'vote_average|desc'}).where('vote_count', '>', 5000)
        .limit(240)
        .paginate(page, 24)

        movies = this.setMaxPage(movies, 10)
      } else {
        const genreId = genre.id
        movies = await this.getByGenreId(genreId).orderBy('release_date', 'desc')
        .paginate(page, 24)
      }

      // movies = movies.toJSON()

      // console.log(movies)

			cached = JSON.stringify(movies)
      const pipeline = this.Redis.pipeline()
      pipeline.set(cacheKey, cached)
      pipeline.expire(cacheKey, this.cacheMovieDuration)
      await pipeline.exec()
    }

		const result = JSON.parse(cached)

    return result
  }

  setMaxPage (data, totalPage) {
    const pages = _.get(data, 'pages')
    const page = _.get(pages, 'page')
    const perPage = _.get(pages, 'perPage')
    const lastPage = _.get(pages, 'lastPage')

    if(lastPage > totalPage) {
      pages.total = perPage * totalPage
      pages.lastPage = totalPage
    }

    if(page > totalPage) {
      data.rows = []
    }

    data.pages = pages
    return data
  }

  async getMasterMovie () {
		const cacheKey = `movie:master.movie:index`
		let cached = await this.Redis.get(cacheKey)

		if (!cached) {

      let genres = await this.GenreRepository.browse({}).fetch()
      genres = genres.toJSON()

      for(let i = 0; i < _.size(genres); i++) {
        const genre = genres[i]
        const genreId = genre.id

        let movies = this.getByGenreId(genreId).orderBy('release_date', 'desc')
        movies = await movies.limit(12).fetch()
        genres[i].movies = movies
      }

      
      let topRateMovies = await this.browse({ filter: {
        // Filter
        is_enable: true
      }, sort: 'vote_average|desc'}).where('vote_count', '>', 5000).limit(12).fetch()
      topRateMovies = topRateMovies.toJSON()

      genres = [{
        name: 'Top Rate',
        slug: 'top_rate',
        movies: topRateMovies
      }].concat(genres)

      let popularMovies = await this.browse({ filter: {
        // Filter
        is_enable: true
      }, sort: 'popularity|desc'}).limit(12).fetch()
      popularMovies = popularMovies.toJSON()

      genres = [{
        name: 'Popular',
        slug: 'popular',
        movies: popularMovies
      }].concat(genres)

			cached = JSON.stringify(genres)
      const pipeline = this.Redis.pipeline()
      pipeline.set(cacheKey, cached)
      pipeline.expire(cacheKey, this.cacheMovieDuration)
      await pipeline.exec()
    }

		const result = JSON.parse(cached)

    return result
  }

  async getMasterMovieByMovieSlug(slug) {
		const cacheKey = `movie:master.movie:film:${slug}`
		let cached = await this.Redis.get(cacheKey)

		if (!cached) {
      const filter = {
        slug: slug
      }

      let movie = await this.browse({ filter: filter })
        .with('credits')
        .with('collection')
        .with('companies')
        .with('genres')
        // .with('source')
        .with('videos')
        .with('medias')
        .first()

      if(!movie) {
        return response.badRequest({
          code: 'movie_not_found',
          message: 'Movie not found'
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

      // Get Movie Similar
      const similarMovies = await this.getMasterMovieBySimilar(genres)

      const data = {
        record: movie,
        collection: collection,
        companies: companies,
        genres: genres,
        people: people,
        similars: similarMovies
      }
      
			cached = JSON.stringify(data)
      const pipeline = this.Redis.pipeline()
      pipeline.set(cacheKey, cached)
      pipeline.expire(cacheKey, this.cacheMovieDuration)
      await pipeline.exec()
    }

		const result = JSON.parse(cached)

    return result

  }

  async getMasterMovieBySimilar (genres) {
    const genreIds = _.map(genres, (genre) => genre.id)
    const genreSlugs = _.map(_.orderBy(genres, ['slug', 'asc']), (genre) => genre.slug)
    const slug = _.join(genreSlugs, '-')

		const cacheKey = `movie:master.movie:similar:${slug}`
		let cached = await this.Redis.get(cacheKey)

		if (!cached) {
      let query = this.MovieGenre.query()
      // query.select('*')
      query.select('mdb_movie_genres.mdb_movie_id', 'mdb_movie_genres.mdb_genre_id')
      query.leftJoin('mdb_movies', 'mdb_movies.id', 'mdb_movie_genres.mdb_movie_id')
      query.whereIn('mdb_genre_id', genreIds)
      query.where('is_enable', 1)
      // query.fetch()
      
      let movies = await query.orderBy('popularity', 'desc')
        .limit(100)
        .fetch()
      movies = movies.toJSON()

      const movieIds = _.map(movies, (movie) => movie.mdb_movie_id)
      const filter = {
        ids: movieIds
      }
      let similarMovies = await this.browse({ filter, sort: 'release_date|desc' })
      .orderByRaw('RAND()')
        .limit(12)
        .fetch()

      similarMovies = similarMovies.toJSON()
  
      // let movies = await query.fetch()
  
			cached = JSON.stringify(similarMovies)
      const pipeline = this.Redis.pipeline()
      pipeline.set(cacheKey, cached)
      pipeline.expire(cacheKey, this.cacheMovieDuration)
      await pipeline.exec()
    }

		const result = JSON.parse(cached)

    return result
  }
}

module.exports = MovieRepository
